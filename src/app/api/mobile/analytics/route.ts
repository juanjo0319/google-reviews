import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/mobile/analytics?orgId=... — analytics data for mobile app
 */
export async function GET(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const orgId = request.nextUrl.searchParams.get("orgId");
  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = createAdminClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.star_rating === star).length,
  }));
  const totalReviews = reviews.length;

  // Sentiment breakdown
  const sentimentBreakdown = {
    positive: reviews.filter((r) => r.sentiment === "positive").length,
    neutral: reviews.filter((r) => r.sentiment === "neutral").length,
    negative: reviews.filter((r) => r.sentiment === "negative").length,
  };

  // Review volume (last 30 days)
  const dailyVolume: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const count = recent.filter((r) => r.created_at.startsWith(dateStr)).length;
    dailyVolume.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count,
    });
  }

  // Response stats
  const publishedResps = resps.filter((r) => r.status === "published" || r.status === "approved");
  const reviewResponsePairs = publishedResps
    .map((resp) => {
      const review = reviews.find((r) => r.id === resp.review_id);
      if (!review) return null;
      const reviewTime = new Date(review.review_created_at ?? review.created_at).getTime();
      const responseTime = new Date(resp.created_at).getTime();
      const diffHours = (responseTime - reviewTime) / (1000 * 60 * 60);
      return diffHours > 0 ? diffHours : null;
    })
    .filter((d): d is number => d !== null);

  const avgResponseTimeHours =
    reviewResponsePairs.length > 0
      ? reviewResponsePairs.reduce((a, b) => a + b, 0) / reviewResponsePairs.length
      : 0;

  const responseRate =
    totalReviews > 0
      ? Math.round((resps.filter((r) => r.status === "published").length / totalReviews) * 100)
      : 0;

  // Top themes
  const themeCounts: Record<string, number> = {};
  for (const review of reviews) {
    for (const theme of review.sentiment_themes ?? []) {
      themeCounts[theme] = (themeCounts[theme] || 0) + 1;
    }
  }
  const topThemes = Object.entries(themeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([theme, count]) => ({ theme, count }));

  // Location comparison
  const locationStats = locs.map((loc) => {
    const locReviews = reviews.filter((r) => r.location_id === loc.id);
    const avg =
      locReviews.length > 0
        ? (locReviews.reduce((s, r) => s + r.star_rating, 0) / locReviews.length).toFixed(1)
        : "0.0";
    return { name: loc.name, count: locReviews.length, avgRating: avg };
  });

  return NextResponse.json({
    totalReviews,
    ratingDistribution,
    sentimentBreakdown,
    dailyVolume,
    responseStats: {
      avgResponseTimeHours,
      responseRate,
      totalResponses: resps.length,
      published: resps.filter((r) => r.status === "published").length,
    },
    topThemes,
    locationStats,
  });
}
