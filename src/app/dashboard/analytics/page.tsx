import { getCurrentOrg } from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { BarChart3, Star, TrendingUp, Clock, Tag, MapPin } from "lucide-react";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default async function AnalyticsPage() {
  const orgData = await getCurrentOrg();
  if (!orgData) return <p className="text-sm text-slate-500">No organization found.</p>;

  const supabase = createAdminClient();
  const orgId = orgData.orgId;

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Fetch all data in parallel
  const [
    { data: allReviews },
    { data: recentReviews },
    { data: responses },
    { data: locations },
  ] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, star_rating, sentiment, sentiment_themes, review_created_at, created_at, location_id")
      .eq("organization_id", orgId),
    supabase
      .from("reviews")
      .select("id, star_rating, created_at")
      .eq("organization_id", orgId)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("responses")
      .select("id, review_id, created_at, status")
      .eq("organization_id", orgId),
    supabase
      .from("locations")
      .select("id, name")
      .eq("organization_id", orgId),
  ]);

  const reviews = allReviews ?? [];
  const recent = recentReviews ?? [];
  const resps = responses ?? [];
  const locs = locations ?? [];

  // --- Rating distribution ---
  const ratingDist = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: reviews.filter((r) => r.star_rating === star).length,
  }));
  const totalReviews = reviews.length;
  const maxRating = Math.max(...ratingDist.map((d) => d.count), 1);

  // --- Sentiment breakdown ---
  const sentimentCounts = {
    positive: reviews.filter((r) => r.sentiment === "positive").length,
    neutral: reviews.filter((r) => r.sentiment === "neutral").length,
    negative: reviews.filter((r) => r.sentiment === "negative").length,
  };
  const sentimentTotal = sentimentCounts.positive + sentimentCounts.neutral + sentimentCounts.negative || 1;

  // --- Review volume over time (last 30 days) ---
  const dailyVolume: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = recent.filter((r) => r.created_at.startsWith(dateStr)).length;
    dailyVolume.push({ date: formatDate(d), count });
  }
  const maxVolume = Math.max(...dailyVolume.map((d) => d.count), 1);

  // --- Response time stats ---
  const reviewResponsePairs = resps
    .filter((resp) => resp.status === "published" || resp.status === "approved")
    .map((resp) => {
      const review = reviews.find((r) => r.id === resp.review_id);
      if (!review) return null;
      const reviewTime = new Date(review.review_created_at ?? review.created_at).getTime();
      const responseTime = new Date(resp.created_at).getTime();
      const diffHours = (responseTime - reviewTime) / (1000 * 60 * 60);
      return diffHours > 0 ? diffHours : null;
    })
    .filter((d): d is number => d !== null);

  const avgResponseTime = reviewResponsePairs.length > 0
    ? (reviewResponsePairs.reduce((a, b) => a + b, 0) / reviewResponsePairs.length)
    : 0;
  const responseRate = totalReviews > 0
    ? Math.round((resps.filter((r) => r.status === "published").length / totalReviews) * 100)
    : 0;

  // --- Top themes ---
  const themeCounts: Record<string, number> = {};
  for (const review of reviews) {
    for (const theme of review.sentiment_themes ?? []) {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }
  }
  const topThemes = Object.entries(themeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  const maxThemeCount = topThemes.length > 0 ? topThemes[0][1] : 1;

  // --- Location comparison ---
  const locationStats = locs.map((loc) => {
    const locReviews = reviews.filter((r) => r.location_id === loc.id);
    const avg = locReviews.length > 0
      ? (locReviews.reduce((s, r) => s + r.star_rating, 0) / locReviews.length).toFixed(1)
      : "0.0";
    return { name: loc.name, count: locReviews.length, avgRating: avg };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Deep insights into your review performance
        </p>
      </div>

      {/* Rating Distribution */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-900">Rating Distribution</h2>
          <span className="ml-auto text-sm text-slate-500">{totalReviews} total reviews</span>
        </div>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((star) => {
            const item = ratingDist.find((d) => d.star === star)!;
            const pct = totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 w-16">{star} star{star !== 1 ? "s" : ""}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all"
                    style={{ width: `${(item.count / maxRating) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500 w-16 text-right">{item.count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sentiment Breakdown */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">Sentiment Breakdown</h2>
          </div>
          <div className="space-y-4">
            {([
              { key: "positive" as const, label: "Positive", color: "bg-green-400", textColor: "text-green-700" },
              { key: "neutral" as const, label: "Neutral", color: "bg-amber-400", textColor: "text-amber-700" },
              { key: "negative" as const, label: "Negative", color: "bg-red-400", textColor: "text-red-700" },
            ]).map(({ key, label, color, textColor }) => {
              const count = sentimentCounts[key];
              const pct = Math.round((count / sentimentTotal) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-medium ${textColor}`}>{label}</span>
                    <span className="text-sm text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Response Time Stats */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">Response Stats</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {avgResponseTime > 0
                  ? avgResponseTime < 1
                    ? `${Math.round(avgResponseTime * 60)}m`
                    : avgResponseTime < 24
                    ? `${avgResponseTime.toFixed(1)}h`
                    : `${(avgResponseTime / 24).toFixed(1)}d`
                  : "--"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Avg. Response Time</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{responseRate}%</p>
              <p className="text-xs text-slate-500 mt-1">Response Rate</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{resps.length}</p>
              <p className="text-xs text-slate-500 mt-1">Total Responses</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">
                {resps.filter((r) => r.status === "published").length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Volume Over Time */}
      <div className="rounded-2xl bg-white border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900">Review Volume</h2>
          <span className="ml-auto text-sm text-slate-500">Last 30 days</span>
        </div>
        <div className="flex items-end gap-1 h-40">
          {dailyVolume.map(({ date, count }, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end group relative"
            >
              <div
                className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-colors min-h-[2px]"
                style={{ height: `${(count / maxVolume) * 140}px` }}
              />
              {/* Show tooltip for every 5th bar */}
              {i % 5 === 0 && (
                <span className="text-[10px] text-slate-400 mt-1 rotate-0">
                  {date}
                </span>
              )}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {date}: {count}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Themes */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-slate-900">Top Themes</h2>
          </div>
          {topThemes.length > 0 ? (
            <div className="space-y-3">
              {topThemes.map(([theme, count]) => (
                <div key={theme} className="flex items-center gap-3">
                  <span className="text-sm text-slate-700 w-32 truncate">{theme}</span>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/30 rounded-full"
                      style={{ width: `${(count / maxThemeCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No theme data available yet.</p>
          )}
        </div>

        {/* Location Comparison */}
        {locationStats.length > 1 && (
          <div className="rounded-2xl bg-white border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-slate-900">Location Comparison</h2>
            </div>
            <div className="space-y-4">
              {locationStats.map((loc) => (
                <div key={loc.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{loc.name}</p>
                    <p className="text-xs text-slate-500">{loc.count} reviews</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-bold text-slate-900">{loc.avgRating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {locationStats.length <= 1 && (
          <div className="rounded-2xl bg-white border border-slate-100 p-6">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-slate-900">Location Comparison</h2>
            </div>
            {locationStats.length === 1 ? (
              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-sm font-medium text-slate-700">{locationStats[0].name}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="text-lg font-bold text-slate-900">{locationStats[0].avgRating}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{locationStats[0].count} reviews</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No locations configured. Add locations in Settings to see comparisons.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
