import {
  Star,
  MessageSquare,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { getReviewStats } from "@/lib/services/reviews";

function StatCard({
  label,
  value,
  change,
  trend,
  icon: Icon,
  iconBg,
}: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <div
          className={"flex h-10 w-10 items-center justify-center rounded-xl " + iconBg}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {change && (
        <div className="flex items-center gap-1 mt-2">
          {trend === "up" ? (
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          ) : trend === "down" ? (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          ) : null}
          <span
            className={"text-sm font-medium " +
              (trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-slate-400")}
          >
            {change}
          </span>
          <span className="text-sm text-slate-400 ml-1">vs last month</span>
        </div>
      )}
    </div>
  );
}

export async function StatCards({ orgId }: { orgId: string }) {
  const stats = await getReviewStats(orgId);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Reviews"
        value={stats.totalReviews.toLocaleString()}
        change={stats.reviewTrend !== 0 ? Math.abs(stats.reviewTrend) + "%" : "\u2014"}
        trend={stats.reviewTrend > 0 ? "up" : stats.reviewTrend < 0 ? "down" : "neutral"}
        icon={MessageSquare}
        iconBg="bg-primary/10 text-primary"
      />
      <StatCard
        label="Average Rating"
        value={stats.avgRating}
        change=""
        trend="neutral"
        icon={Star}
        iconBg="bg-amber-100 text-amber-600"
      />
      <StatCard
        label="Response Rate"
        value={stats.responseRate + "%"}
        change=""
        trend="neutral"
        icon={TrendingUp}
        iconBg="bg-green-100 text-green-600"
      />
      <StatCard
        label="Sentiment Score"
        value={stats.sentimentScore}
        change=""
        trend="neutral"
        icon={BarChart3}
        iconBg="bg-purple-100 text-purple-600"
      />
    </div>
  );
}
