"use client";

import { useTransition } from "react";
import { Zap, ArrowRight } from "lucide-react";
import { createCheckoutSession } from "@/app/actions/billing";
import { PLANS, getNextPlan } from "@/lib/stripe/config";

interface UpgradePromptProps {
  feature: string;
  currentLimit: number;
  currentUsage: number;
  currentPlan: string;
}

export function UpgradePrompt({
  feature,
  currentLimit,
  currentUsage,
  currentPlan,
}: UpgradePromptProps) {
  const [isPending, startTransition] = useTransition();
  const nextPlan = getNextPlan(currentPlan);

  if (!nextPlan) return null;

  function handleUpgrade() {
    if (!nextPlan?.priceId) return;
    startTransition(async () => {
      await createCheckoutSession(nextPlan.priceId);
    });
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
          <Zap className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900">
            {feature} limit reached
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            You&apos;ve used{" "}
            <span className="font-medium">{currentUsage}</span> of{" "}
            <span className="font-medium">{currentLimit}</span> {feature} on
            your {PLANS[currentPlan]?.name ?? "current"} plan. Upgrade to{" "}
            <span className="font-medium">{nextPlan.name}</span> for up to{" "}
            <span className="font-medium">
              {nextPlan.limits.locations === Infinity
                ? "unlimited"
                : Object.values(nextPlan.limits).find(
                    (v) => v > currentLimit
                  ) ?? "more"}
            </span>
            .
          </p>
          <button
            onClick={handleUpgrade}
            disabled={isPending}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {isPending ? (
              "Redirecting..."
            ) : (
              <>
                Upgrade to {nextPlan.name}
                {nextPlan.price && " — $" + nextPlan.price + "/mo"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
