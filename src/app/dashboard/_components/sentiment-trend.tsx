import { createAdminClient } from "@/lib/supabase/admin";

export async function SentimentTrend({ orgId }: { orgId: string }) {
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
    .eq("organization_id", orgId)
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
