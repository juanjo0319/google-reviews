import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { getReviewStats, getRecentReviews, getUrgentReviews } from "@/lib/services/reviews";

/**
 * GET /api/mobile/reviews/stats?orgId=... — dashboard stats
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

  const [stats, recent, urgent] = await Promise.all([
    getReviewStats(orgId),
    getRecentReviews(orgId, 10),
    getUrgentReviews(orgId),
  ]);

  // Convert Map to plain object for JSON serialization
  const recentResponseMap: Record<string, string> = {};
  for (const [key, value] of recent.responseMap) {
    recentResponseMap[key] = value;
  }

  return NextResponse.json({
    stats,
    recentReviews: recent.reviews.map((r) => ({
      ...r,
      responseStatus: recentResponseMap[r.id] ?? null,
    })),
    urgentReviews: urgent,
  });
}
