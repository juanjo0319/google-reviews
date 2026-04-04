import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, getMobileOrg } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/client";
import type Stripe from "stripe";

const BASE_URL =
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

/**
 * POST /api/mobile/billing/checkout — create a Stripe checkout session URL
 * Returns the checkout URL for the mobile app to open in a browser.
 */
export async function POST(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const priceId: string | undefined = body.priceId;
  const orgId: string | undefined = body.orgId;

  if (!priceId) {
    return NextResponse.json({ error: "priceId is required" }, { status: 400 });
  }

  const orgData = orgId
    ? await getMobileOrg(session.userId, orgId)
    : await getMobileOrg(session.userId);

  if (!orgData) {
    return NextResponse.json(
      { error: "No organization found" },
      { status: 404 }
    );
  }

  const supabase = createAdminClient();
  const stripe = getStripe();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, stripe_customer_id, name")
    .eq("id", orgData.orgId)
    .single();

  if (!org) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }

  const planTier =
    priceId === process.env.STRIPE_STARTER_PRICE_ID
      ? "starter"
      : priceId === process.env.STRIPE_PRO_PRICE_ID
        ? "pro"
        : priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID
          ? "enterprise"
          : "starter";

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: BASE_URL + "/dashboard/settings/billing?success=true",
    cancel_url: BASE_URL + "/dashboard/settings/billing?canceled=true",
    subscription_data: {
      trial_period_days: 14,
      metadata: { orgId: org.id, planTier },
    },
    metadata: { orgId: org.id, planTier },
  };

  if (org.stripe_customer_id) {
    params.customer = org.stripe_customer_id;
  } else {
    params.customer_email = session.email;
  }

  const checkoutSession = await stripe.checkout.sessions.create(params);

  if (!checkoutSession.url) {
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }

  // Return URL instead of redirecting (mobile app opens this in a browser)
  return NextResponse.json({ url: checkoutSession.url });
}
