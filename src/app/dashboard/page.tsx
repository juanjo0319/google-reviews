import { Suspense } from "react";
import {
  Star,
  MessageSquare,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentOrg } from "@/lib/auth/permissions";

// --- Skeleton loaders ---

function StatCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-100 animate-pulse">
      <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
      <div className="h-8 w-16 bg-slate-200 rounded mb-2" />
      <div className="h-3 w-20 bg-slate-100 rounded" />
    </div>
  );
}

function ReviewListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl bg-white p-4 border border-slate-100 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-48 bg-slate-100 rounded" />
            </div>
            <div className="h-6 w-16 bg-slate-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Stat card component ---

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

function StarDisplay({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={"h-3.5 w-3.5 " +
            (i < count
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-200")}
        />
      ))}
    </div>
  );
}

const sentimentColors: Record<string, string> = {
  positive: "bg-green-100 text-green-700",
  neutral: "bg-amber-100 text-amber-700",
  negative: "bg-red-100 text-red-700",
};

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  return days + "d ago";
}

// --- Data-fetching components ---

async function StatCards() {
  const orgData = await getCurrentOrg();
  if (!orgData) return null;

  const supabase = createAdminClient();
  const orgId = orgData.orgId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Current month stats
  const [
    { count: totalReviews },
    { data: ratingData },
    { count: respondedCount },
    { data: sentimentData },
    { count: lastMonthReviews },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId),
    supabase
      .from("reviews")
      .select("star_rating")
      .eq("organization_id", orgId),
    supabase
      .from("responses")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .in("status", ["published", "approved", "pending_approval", "draft"]),
    supabase
      .from("reviews")
      .select("sentiment")
      .eq("organization_id", orgId)
      .gte("created_at", startOfMonth.toISOString()),
    supabase
      .from("reviews")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgId)
      .gte("created_at", startOfLastMonth.toISOString())
      .lt("created_at", startOfMonth.toISOString()),
  ]);

  const total = totalReviews ?? 0;
  const ratings = ratingData ?? [];
  const avgRating = ratings.length > 0
    ? (ratings.reduce((s, r) => s + r.star_rating, 0) / ratings.length).toFixed(1)
    : "0.0";

  const responseRate = total > 0
    ? Math.round(((respondedCount ?? 0) / total) * 100)
    : 0;

  const sentiments = sentimentData ?? [];
  const positiveCount = sentiments.filter((s) => s.sentiment === "positive").length;
  const sentimentScore = sentiments.length > 0
    ? ((positiveCount / sentiments.length) * 10).toFixed(1)
    : "0.0";

  // Trend calculation
  const lastMonth = lastMonthReviews ?? 0;
  const reviewTrend = lastMonth > 0
    ? Math.round(((total - lastMonth) / lastMonth) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Reviews"
        value={total.toLocaleString()}
        change={reviewTrend !== 0 ? Math.abs(reviewTrend) + "%" : "—"}
        trend={reviewTrend > 0 ? "up" : reviewTrend < 0 ? "down" : "neutral"}
        icon={MessageSquare}
        iconBg="bg-primary/10 text-primary"
      />
      <StatCard
        label="Average Rating"
        value={avgRating}
        change=""
        trend="neutral"
        icon={Star}
        iconBg="bg-amber-100 text-amber-600"
      />
      <StatCard
        label="Response Rate"
        value={responseRate + "%"}
        change=""
        trend="neutral"
        icon={TrendingUp}
        iconBg="bg-green-100 text-green-600"
      />
      <StatCard
        label="Sentiment Score"
        value={sentimentScore}
        change=""
        trend="neutral"
        icon={BarChart3}
        iconBg="bg-purple-100 text-purple-600"
      />
    </div>
  );
}

async function SentimentTrend() {
  const orgData = await getCurrentOrg();
  if (!orgData) return null;

  const supabase = createAdminClient();
  const now = new Date();

  // Get last 7 days of reviews with sentiment
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("sentiment, created_at")
    .eq("organization_id", orgData.orgId)
    .gte("created_at", weekAgo.toISOString());

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const data = days.map((day) => {
    const dayReviews = (reviews ?? []).filter((r) => {
      const rd = new Date(r.created_at);
      return rd.toDateString() === day.toDateString();
    });
    const total = dayReviews.length || 1; // avoid division by zero
    return {
      label: dayLabels[day.getDay()],
      positive: Math.round((dayReviews.filter((r) => r.sentiment === "positive").length / total) * 100),
      neutral: Math.round((dayReviews.filter((r) => r.sentiment === "neutral").length / total) * 100),
      negative: Math.round((dayReviews.filter((r) => r.sentiment === "negative").length / total) * 100),
      count: dayReviews.length,
    };
  });

  return (
    <div className="rounded-2xl bg-white p-6 border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Sentiment Trend</h2>
        <span className="text-sm text-slate-500">Last 7 days</span>
      </div>
      <div className="flex items-end gap-3 h-40">
        {data.map(({ label, positive, neutral, negative, count }) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col gap-0.5" style={{ height: "120px" }}>
              {count > 0 ? (
                <>
                  <div className="w-full bg-green-400 rounded-t" style={{ height: (positive / 100) * 120 + "px" }} />
                  <div className="w-full bg-amber-400" style={{ height: (neutral / 100) * 120 + "px" }} />
                  <div className="w-full bg-red-400 rounded-b" style={{ height: (negative / 100) * 120 + "px" }} />
                </>
              ) : (
                <div className="w-full bg-slate-100 rounded h-full" />
              )}
            </div>
            <span className="text-xs text-slate-500 mt-1">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          <span className="text-xs text-slate-500">Positive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="text-xs text-slate-500">Neutral</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="text-xs text-slate-500">Negative</span>
        </div>
      </div>
    </div>
  );
}

async function RecentReviews() {
  const orgData = await getCurrentOrg();
  if (!orgData) return null;

  const supabase = createAdminClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, reviewer_name, star_rating, comment, sentiment, review_created_at, created_at")
    .eq("organization_id", orgData.orgId)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get response status for these reviews
  const reviewIds = (reviews ?? []).map((r) => r.id);
  const { data: responses } = reviewIds.length > 0
    ? await supabase
        .from("responses")
        .select("review_id, status")
        .in("review_id", reviewIds)
    : { data: [] };

  const responseMap = new Map<string, string>();
  for (const r of responses ?? []) {
    responseMap.set(r.review_id, r.status);
  }

  if (!reviews?.length) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-12 text-center">
        <Inbox className="h-10 w-10 text-slate-200 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-900 mb-1">No reviews yet</h3>
        <p className="text-sm text-slate-500">
          Connect your Google Business Profile to start syncing reviews.
        </p>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:text-primary-dark"
        >
          Go to Settings <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-100">
      <div className="flex items-center justify-between p-6 pb-4">
        <h2 className="text-lg font-semibold text-slate-900">Recent Reviews</h2>
        <Link
          href="/dashboard/reviews"
          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-slate-100">
        {reviews.map((review) => {
          const status = responseMap.get(review.id);
          const statusLabel = status
            ? status === "published" ? "responded" : "pending"
            : "unresponded";
          const statusColor = statusLabel === "responded"
            ? "bg-primary/10 text-primary"
            : statusLabel === "pending"
            ? "bg-amber-100 text-amber-700"
            : "bg-slate-100 text-slate-600";

          return (
            <Link key={review.id} href={"/dashboard/reviews/" + review.id} className="flex items-start gap-3 px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                {(review.reviewer_name ?? "?")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900">
                    {review.reviewer_name ?? "Anonymous"}
                  </span>
                  <StarDisplay count={review.star_rating} />
                  <span className="text-xs text-slate-400 ml-auto shrink-0">
                    {formatTimeAgo(review.review_created_at ?? review.created_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 truncate">{review.comment ?? "(no text)"}</p>
                <div className="flex items-center gap-2 mt-2">
                  {review.sentiment && (
                    <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " + (sentimentColors[review.sentiment] ?? "bg-slate-100 text-slate-600")}>
                      {review.sentiment}
                    </span>
                  )}
                  <span className={"inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " + statusColor}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

async function ActionRequired() {
  const orgData = await getCurrentOrg();
  if (!orgData) return null;

  const supabase = createAdminClient();

  // Negative/urgent reviews without responses
  const { data: urgentReviews } = await supabase
    .from("reviews")
    .select("id, reviewer_name, star_rating, comment, review_created_at, created_at")
    .eq("organization_id", orgData.orgId)
    .or("sentiment.eq.negative,requires_urgent_response.eq.true")
    .order("created_at", { ascending: false })
    .limit(5);

  // Filter out ones that already have responses
  const reviewIds = (urgentReviews ?? []).map((r) => r.id);
  const { data: existingResponses } = reviewIds.length > 0
    ? await supabase
        .from("responses")
        .select("review_id")
        .in("review_id", reviewIds)
    : { data: [] };

  const respondedIds = new Set((existingResponses ?? []).map((r) => r.review_id));
  const unrespondedUrgent = (urgentReviews ?? []).filter((r) => !respondedIds.has(r.id));

  if (unrespondedUrgent.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-slate-100 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 mx-auto mb-3">
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>
        <p className="text-sm font-medium text-slate-700">All caught up!</p>
        <p className="text-xs text-slate-500 mt-1">No urgent reviews need attention.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-100">
      <div className="flex items-center gap-2 p-6 pb-4">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <h2 className="text-lg font-semibold text-slate-900">Action Required</h2>
        <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {unrespondedUrgent.length}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {unrespondedUrgent.map((item) => (
          <div key={item.id} className="flex items-start gap-3 px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-600">
              {(item.reviewer_name ?? "?")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-slate-900">{item.reviewer_name ?? "Anonymous"}</span>
                <StarDisplay count={item.star_rating} />
                <span className="text-xs text-slate-400 ml-auto shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeAgo(item.review_created_at ?? item.created_at)}
                </span>
              </div>
              <p className="text-sm text-slate-600 truncate">{item.comment ?? "(no text)"}</p>
              <Link
                href={"/dashboard/reviews/" + item.id}
                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-primary-dark"
              >
                Respond now <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Page ---

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your review performance</p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <StatCards />
      </Suspense>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Suspense fallback={<ReviewListSkeleton />}>
            <RecentReviews />
          </Suspense>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <Suspense>
            <SentimentTrend />
          </Suspense>
          <Suspense fallback={<ReviewListSkeleton />}>
            <ActionRequired />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
