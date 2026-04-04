import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/mobile/reviews?orgId=...&limit=50&offset=0&stars=1,2&sentiment=negative&locationId=...&search=...
 */
export async function GET(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { searchParams } = request.nextUrl;
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const starsParam = searchParams.get("stars");
  const sentiment = searchParams.get("sentiment");
  const locationId = searchParams.get("locationId");
  const search = searchParams.get("search");

  const supabase = createAdminClient();

  let query = supabase
    .from("reviews")
    .select(
      "id, reviewer_name, reviewer_photo_url, star_rating, comment, sentiment, sentiment_themes, review_created_at, created_at, requires_urgent_response, location_id, locations(name)",
      { count: "exact" }
    )
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (starsParam) {
    const stars = starsParam.split(",").map(Number).filter((n) => n >= 1 && n <= 5);
    if (stars.length > 0) {
      query = query.in("star_rating", stars);
    }
  }

  if (sentiment) {
    query = query.eq("sentiment", sentiment);
  }

  if (locationId) {
    query = query.eq("location_id", locationId);
  }

  if (search) {
    query = query.ilike("comment", `%${search}%`);
  }

  const { data: reviews, count } = await query;

  // Get response status for these reviews
  const reviewIds = (reviews ?? []).map((r) => r.id);
  const { data: responses } = reviewIds.length > 0
    ? await supabase
        .from("responses")
        .select("review_id, status")
        .in("review_id", reviewIds)
    : { data: [] };

  const responseMap: Record<string, string> = {};
  for (const r of responses ?? []) {
    responseMap[r.review_id] = r.status;
  }

  return NextResponse.json({
    reviews: (reviews ?? []).map((r) => ({
      ...r,
      responseStatus: responseMap[r.id] ?? null,
    })),
    total: count ?? 0,
    limit,
    offset,
  });
}
