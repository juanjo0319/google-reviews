"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentOrg } from "@/lib/auth/permissions";
import type Stripe from "stripe";

const BASE_URL =
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

export async function createCheckoutSession(priceId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const orgData = await getCurrentOrg();
  if (!orgData) throw new Error("No organization found");

  const supabase = createAdminClient();
  const stripe = getStripe();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, stripe_customer_id, name")
    .eq("id", orgData.orgId)
    .single();

  if (!org) throw new Error("Organization not found");

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
    params.customer_email = session.user.email ?? undefined;
  }

  const checkoutSession = await stripe.checkout.sessions.create(params);

  if (!checkoutSession.url) throw new Error("Failed to create checkout session");

  redirect(checkoutSession.url);
}

export async function redirectToCustomerPortal() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const orgData = await getCurrentOrg();
  if (!orgData) throw new Error("No organization found");

  const supabase = createAdminClient();
  const stripe = getStripe();

  const { data: org } = await supabase
    .from("organizations")
    .select("stripe_customer_id")
    .eq("id", orgData.orgId)
    .single();

  if (!org?.stripe_customer_id) {
    throw new Error("No Stripe customer found. Subscribe to a plan first.");
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: BASE_URL + "/dashboard/settings/billing",
  });

  redirect(portalSession.url);
}
