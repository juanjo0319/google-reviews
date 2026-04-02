import { createAdminClient } from "@/lib/supabase/admin";

export interface ReviewStatsResult {
  totalReviews: number;
  avgRating: string;
  responseRate: number;
  sentimentScore: string;
  reviewTrend: number;
}

/**
 * Get review stats (total, avg rating, response rate, sentiment score) for an org.
 */
export async function getReviewStats(orgId: string): Promise<ReviewStatsResult> {
  const supabase = createAdminClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

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

  const lastMonth = lastMonthReviews ?? 0;
  const reviewTrend = lastMonth > 0
    ? Math.round(((total - lastMonth) / lastMonth) * 100)
    : 0;

  return { totalReviews: total, avgRating, responseRate, sentimentScore, reviewTrend };
}

export interface RecentReviewRow {
  id: string;
  reviewer_name: string | null;
  star_rating: number;
  comment: string | null;
  sentiment: string | null;
  review_created_at: string | null;
  created_at: string;
}

/**
 * Get the most recent reviews for an org.
 */
export async function getRecentReviews(
  orgId: string,
  limit = 5
): Promise<{ reviews: RecentReviewRow[]; responseMap: Map<string, string> }> {
  const supabase = createAdminClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, reviewer_name, star_rating, comment, sentiment, review_created_at, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(limit);

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

  return { reviews: (reviews ?? []) as RecentReviewRow[], responseMap };
}

export interface UrgentReviewRow {
  id: string;
  reviewer_name: string | null;
  star_rating: number;
  comment: string | null;
  review_created_at: string | null;
  created_at: string;
}

/**
 * Get urgent/negative reviews that still need a response.
 */
export async function getUrgentReviews(orgId: string): Promise<UrgentReviewRow[]> {
  const supabase = createAdminClient();

  const { data: urgentReviews } = await supabase
    .from("reviews")
    .select("id, reviewer_name, star_rating, comment, review_created_at, created_at")
    .eq("organization_id", orgId)
    .or("sentiment.eq.negative,requires_urgent_response.eq.true")
    .order("created_at", { ascending: false })
    .limit(5);

  const reviewIds = (urgentReviews ?? []).map((r) => r.id);
  const { data: existingResponses } = reviewIds.length > 0
    ? await supabase
        .from("responses")
        .select("review_id")
        .in("review_id", reviewIds)
    : { data: [] };

  const respondedIds = new Set((existingResponses ?? []).map((r) => r.review_id));
  return ((urgentReviews ?? []) as UrgentReviewRow[]).filter((r) => !respondedIds.has(r.id));
}

/**
 * Get reviews for an org with optional filters.
 */
export async function getReviewsForOrg(
  orgId: string,
  options?: { limit?: number; sentiment?: string; stars?: number[] }
) {
  const supabase = createAdminClient();

  let query = supabase
    .from("reviews")
    .select("id, reviewer_name, reviewer_photo_url, star_rating, comment, sentiment, review_created_at, created_at, locations(name)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(options?.limit ?? 50);

  if (options?.stars && options.stars.length > 0) {
    query = query.in("star_rating", options.stars);
  }

  if (options?.sentiment) {
    query = query.eq("sentiment", options.sentiment);
  }

  const { data: reviews } = await query;

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

  return { reviews: reviews ?? [], responseMap };
}
