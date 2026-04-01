"use client";

import { useTransition } from "react";
import { Check, Zap, ArrowRight, Crown } from "lucide-react";
import { createCheckoutSession, redirectToCustomerPortal } from "@/app/actions/billing";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import type { PlanLimits } from "@/lib/stripe/config";

interface PlanDisplay {
  tier: string;
  name: string;
  price: number | null;
  priceId: string;
  limits: PlanLimits;
  isCurrent: boolean;
  isHighlighted: boolean;
}

interface BillingClientProps {
  planTier: string;
  planName: string;
  limits: PlanLimits;
  usage: {
    locations: number;
    reviewsThisMonth: number;
    teamMembers: number;
    aiResponsesThisMonth: number;
  };
  subscriptionStatus: string | null;
  periodEnd: string | null;
  hasStripeCustomer: boolean;
  plans: PlanDisplay[];
}

function BillingContent(props: BillingClientProps) {
  const {
    planName,
    limits,
    usage,
    subscriptionStatus,
    periodEnd,
    hasStripeCustomer,
    plans,
  } = props;

  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");

  function handleCheckout(priceId: string) {
    startTransition(async () => {
      await createCheckoutSession(priceId);
    });
  }

  function handlePortal() {
    startTransition(async () => {
      await redirectToCustomerPortal();
    });
  }

  function formatLimit(val: number): string {
    return val === Infinity ? "Unlimited" : String(val);
  }

  const usageItems = [
    { label: "Locations", current: usage.locations, limit: limits.locations },
    { label: "Reviews this month", current: usage.reviewsThisMonth, limit: limits.reviewsPerMonth },
    { label: "AI responses", current: usage.aiResponsesThisMonth, limit: limits.aiResponsesPerMonth },
    { label: "Team members", current: usage.teamMembers, limit: limits.teamMembers },
  ];

  return (
    <div className="space-y-6">
      {/* Success/cancel banners */}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Subscription activated! Your plan has been upgraded.
        </div>
      )}
      {canceled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Checkout was canceled. No changes were made.
        </div>
      )}

      {/* Current plan */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Current Plan</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              You are on the{" "}
              <span className="font-medium text-slate-700">{planName}</span> plan
            </p>
          </div>
          <div className="flex items-center gap-2">
            {subscriptionStatus && (
              <span
                className={
                  "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium " +
                  (subscriptionStatus === "active" || subscriptionStatus === "trialing"
                    ? "bg-green-100 text-green-700"
                    : subscriptionStatus === "past_due"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-600")
                }
              >
                {subscriptionStatus === "trialing" ? "Trial" : subscriptionStatus}
              </span>
            )}
            {periodEnd && (
              <span className="text-xs text-slate-400">
                Renews {new Date(periodEnd).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Usage bars */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {usageItems.map(({ label, current, limit }) => {
            const pct = limit === Infinity ? 0 : Math.round((current / limit) * 100);
            return (
              <div key={label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className="text-xs font-medium text-slate-900">
                    {current} / {formatLimit(limit)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={
                      "h-full rounded-full transition-all " +
                      (pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-primary")
                    }
                    style={{ width: (limit === Infinity ? 0 : Math.min(pct, 100)) + "%" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {hasStripeCustomer && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={handlePortal}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Manage Subscription
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Plan comparison */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">
            {hasStripeCustomer ? "Change Plan" : "Upgrade Your Plan"}
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={
                "rounded-xl p-5 border " +
                (plan.isHighlighted
                  ? "border-primary bg-primary/5"
                  : plan.isCurrent
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-slate-200")
              }
            >
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-base font-semibold text-slate-900">
                  {plan.name}
                </h3>
                {plan.isCurrent && <Crown className="h-4 w-4 text-primary" />}
              </div>
              <div className="mt-2 mb-4">
                {plan.price !== null ? (
                  <>
                    <span className="text-2xl font-bold text-slate-900">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-slate-500">/mo</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-slate-900">Custom</span>
                )}
              </div>
              <ul className="space-y-2 mb-5 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  {formatLimit(plan.limits.locations)} locations
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  {formatLimit(plan.limits.reviewsPerMonth)} reviews/mo
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  {formatLimit(plan.limits.aiResponsesPerMonth)} AI responses/mo
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  {formatLimit(plan.limits.teamMembers)} team members
                </li>
              </ul>
              {plan.isCurrent ? (
                <div className="w-full rounded-lg py-2 text-sm font-semibold text-center text-primary bg-primary/10">
                  Current Plan
                </div>
              ) : plan.price === null ? (
                <button className="w-full rounded-lg py-2 text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors">
                  Contact Sales
                </button>
              ) : plan.price === 0 ? (
                <div className="w-full rounded-lg py-2 text-sm font-semibold text-center text-slate-400">
                  Free
                </div>
              ) : (
                <button
                  onClick={() => handleCheckout(plan.priceId)}
                  disabled={isPending || !plan.priceId}
                  className={
                    "w-full rounded-lg py-2 text-sm font-semibold transition-colors disabled:opacity-50 " +
                    (plan.isHighlighted
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50")
                  }
                >
                  {isPending ? "Redirecting..." : "Upgrade"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BillingClient(props: BillingClientProps) {
  return (
    <Suspense>
      <BillingContent {...props} />
    </Suspense>
  );
}
