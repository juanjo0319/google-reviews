import { getCurrentOrg } from "@/lib/auth/permissions";
import { getAIUsageSummary } from "@/lib/ai/usage";
import { BarChart3, Zap, DollarSign, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UsagePage() {
  const orgData = await getCurrentOrg();
  if (!orgData) {
    return <p className="text-sm text-slate-500">No organization found.</p>;
  }

  const usage = await getAIUsageSummary(orgData.orgId);

  const isUnlimited = usage.budgetLimit === -1;
  const budgetDisplay = isUnlimited
    ? "Unlimited"
    : `$${usage.budgetLimit.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Budget bar */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">
            AI Usage — Current Month
          </h2>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">
              ${usage.currentMonthCost.toFixed(4)} of {budgetDisplay} used
            </span>
            {!isUnlimited && (
              <span className="text-sm font-medium text-slate-900">
                {usage.budgetUsedPercent}%
              </span>
            )}
          </div>
          {!isUnlimited && (
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  usage.budgetUsedPercent > 90
                    ? "bg-red-500"
                    : usage.budgetUsedPercent > 70
                    ? "bg-amber-500"
                    : "bg-primary"
                }`}
                style={{
                  width: `${Math.min(usage.budgetUsedPercent, 100)}%`,
                }}
              />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Total Cost</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              ${usage.currentMonthCost.toFixed(4)}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Total Tokens</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              {(
                usage.currentMonthInputTokens +
                usage.currentMonthOutputTokens
              ).toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-slate-400" />
              <span className="text-xs text-slate-500">Daily Average</span>
            </div>
            <p className="text-lg font-bold text-slate-900">
              ${usage.dailyAverage.toFixed(4)}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown by operation */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Cost Breakdown by Operation
        </h2>

        {Object.keys(usage.byOperation).length === 0 ? (
          <p className="text-sm text-slate-500">
            No AI usage recorded this month.
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(usage.byOperation)
              .sort((a, b) => b[1].cost - a[1].cost)
              .map(([operation, data]) => {
                const pct = usage.currentMonthCost > 0
                  ? (data.cost / usage.currentMonthCost) * 100
                  : 0;
                return (
                  <div key={operation}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700 capitalize">
                        {operation.replace(/_/g, " ")}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-900">
                          ${data.cost.toFixed(4)}
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          ({data.count} calls)
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Token details */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Token Usage
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Input Tokens</p>
            <p className="text-xl font-bold text-slate-900">
              {usage.currentMonthInputTokens.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">Output Tokens</p>
            <p className="text-xl font-bold text-slate-900">
              {usage.currentMonthOutputTokens.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
