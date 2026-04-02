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
  MapPin,
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

// --- Setup prompt when no locations connected ---

async function SetupPrompt() {
  const orgData = await getCurrentOrg();
  if (!orgData) return null;

  const supabase = createAdminClient();

  // Check if org has any connected locations
  const { count: locationCount } = await supabase
    .from("locations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgData.orgId);

  if (locationCount && locationCount > 0) return null;

  // Check if Google tokens exist
  const { count: tokenCount } = await supabase
    .from("google_oauth_tokens")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgData.orgId);

  const hasGoogleConnected = (tokenCount ?? 0) > 0;

  return (
    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 lg:p-12">
      <div className="max-w-lg mx-auto text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
          <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          {hasGoogleConnected
            ? "Select your business locations"
            : "Connect your Google Business Profile"}
        </h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          {hasGoogleConnected
            ? "Your Google account is connected! Now select which locations you'd like to manage reviews for."
            : "Link your Google Business Profile to start syncing and responding to your reviews with AI. It only takes a minute."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasGoogleConnected ? (
            <Link
              href="/dashboard/settings/locations"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
            >
              <MapPin className="h-4 w-4" />
              Select Locations
            </Link>
          ) : (
            <a
              href="/api/google/connect"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="currentColor" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" opacity={0.7} />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" opacity={0.5} />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" opacity={0.8} />
              </svg>
              Connect Google Business
            </a>
          )}
          <Link
            href="/dashboard/help"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Learn how it works
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-primary/10">
          {[
            { step: "1", label: "Connect Google", done: hasGoogleConnected },
            { step: "2", label: "Select locations", done: false },
            { step: "3", label: "AI handles reviews", done: false },
          ].map(({ step, label, done }) => (
            <div key={step} className="text-center">
              <div className={"flex h-8 w-8 items-center justify-center rounded-full mx-auto mb-2 text-sm font-bold " +
                (done ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400")}>
                {done ? <TrendingUp className="h-4 w-4" /> : step}
              </div>
              <p className={"text-xs font-medium " + (done ? "text-green-600" : "text-slate-500")}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Page ---

export default async function DashboardPage() {
  const orgData = await getCurrentOrg();
  const supabase = createAdminClient();

  // Check if org has locations
  let hasLocations = false;
  if (orgData) {
    const { count } = await supabase
      .from("locations")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", orgData.orgId);
    hasLocations = (count ?? 0) > 0;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your review performance</p>
      </div>

      {!hasLocations ? (
        <Suspense>
          <SetupPrompt />
        </Suspense>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
