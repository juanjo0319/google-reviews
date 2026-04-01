import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, stripe, session);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(supabase, subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(supabase, invoice);
        break;
      }
      default:
        // Unhandled event type — acknowledge silently
        break;
    }

    // Log all webhook events to audit_log
    const orgId = extractOrgId(event);
    if (orgId) {
      await supabase.from("audit_log").insert({
        organization_id: orgId,
        action: "stripe.webhook." + event.type,
        entity_type: "subscription",
        metadata: { eventId: event.id, eventType: event.type },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

// --- Handlers ---

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof createAdminClient>,
  stripe: ReturnType<typeof getStripe>,
  session: Stripe.Checkout.Session
) {
  const orgId = session.metadata?.orgId;
  const planTier = session.metadata?.planTier ?? "starter";

  if (!orgId) {
    console.error("Checkout session missing orgId metadata");
    return;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  // Set stripe_customer_id on the organization
  if (customerId) {
    await supabase
      .from("organizations")
      .update({
        stripe_customer_id: customerId,
        plan_tier: planTier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orgId);
  }

  // Get the subscription from the checkout session
  if (session.subscription) {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Idempotency: check if subscription record already exists
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("stripe_subscription_id", subscriptionId)
      .single();

    if (!existing) {
      // In Stripe v2025, use cancel_at or billing_cycle_anchor as period reference
      const periodEnd = subscription.cancel_at
        ? new Date(subscription.cancel_at * 1000).toISOString()
        : null;

      await supabase.from("subscriptions").insert({
        organization_id: orgId,
        stripe_subscription_id: subscriptionId,
        stripe_price_id: subscription.items.data[0]?.price.id ?? null,
        stripe_current_period_end: periodEnd,
        status: subscription.status,
        plan_tier: planTier,
      });
    }
  }
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id;
  const planTier =
    subscription.metadata?.planTier ??
    inferPlanTierFromPrice(priceId);

  const periodEnd = subscription.cancel_at
    ? new Date(subscription.cancel_at * 1000).toISOString()
    : null;

  await supabase
    .from("subscriptions")
    .update({
      stripe_price_id: priceId ?? null,
      stripe_current_period_end: periodEnd,
      status: subscription.status,
      plan_tier: planTier,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  // Also update org plan_tier
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabase
      .from("organizations")
      .update({
        plan_tier: planTier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sub.organization_id);
  }
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof createAdminClient>,
  subscription: Stripe.Subscription
) {
  await supabase
    .from("subscriptions")
    .update({
      status: "canceled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  // Reset org to free plan
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("organization_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabase
      .from("organizations")
      .update({
        plan_tier: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("id", sub.organization_id);
  }
}

async function handlePaymentFailed(
  supabase: ReturnType<typeof createAdminClient>,
  invoice: Stripe.Invoice
) {
  // In Stripe v2025, subscription is accessed via parent on the invoice
  // or from the invoice line items. Use the customer to find the subscription.
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id ?? null;

  if (customerId) {
    // Find org by customer ID and set subscription to past_due
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (org) {
      await supabase
        .from("subscriptions")
        .update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        })
        .eq("organization_id", org.id);
    }
  }

  console.warn(
    "Payment failed for invoice " +
      invoice.id +
      ", customer: " +
      customerId
  );
}

// --- Helpers ---

function extractOrgId(event: Stripe.Event): string | null {
  const obj = event.data.object as unknown as Record<string, unknown>;
  const metadata = obj.metadata as Record<string, string> | undefined;
  return metadata?.orgId ?? null;
}

function inferPlanTierFromPrice(priceId: string | undefined): string {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_STARTER_PRICE_ID) return "starter";
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return "pro";
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return "enterprise";
  return "starter";
}
