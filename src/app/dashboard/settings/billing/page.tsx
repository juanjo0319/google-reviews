import { getCurrentOrg } from "@/lib/auth/permissions";
import { getUsageCounts } from "@/lib/billing/gates";
import { getPlanByTier, PLANS } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";
import { BillingClient } from "./billing-client";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) return <p className="text-sm text-slate-500">No organization found.</p>;

  const supabase = createAdminClient();

  // Get org details and subscription
  const [{ data: org }, { data: subscription }, usage] = await Promise.all([
    supabase
      .from("organizations")
      .select("plan_tier, stripe_customer_id")
      .eq("id", orgData.orgId)
      .single(),
    supabase
      .from("subscriptions")
      .select("status, plan_tier, stripe_current_period_end")
      .eq("organization_id", orgData.orgId)
      .single(),
    getUsageCounts(orgData.orgId),
  ]);

  const planTier = org?.plan_tier ?? "free";
  const plan = getPlanByTier(planTier);
  const hasStripeCustomer = !!org?.stripe_customer_id;

  return (
    <BillingClient
      planTier={planTier}
      planName={plan.name}
      limits={plan.limits}
      usage={usage}
      subscriptionStatus={subscription?.status ?? null}
      periodEnd={subscription?.stripe_current_period_end ?? null}
      hasStripeCustomer={hasStripeCustomer}
      plans={Object.entries(PLANS).map(([tier, config]) => ({
        tier,
        name: config.name,
        price: config.price,
        priceId: config.priceId,
        limits: config.limits,
        isCurrent: tier === planTier,
        isHighlighted: tier === "pro",
      }))}
    />
  );
}
