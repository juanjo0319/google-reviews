import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/mobile/locations?orgId=... — list locations for an org
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

  const { data: locations } = await supabase
    .from("locations")
    .select("id, name, address, phone, google_place_id, google_location_id, is_verified, last_synced_at, created_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });

  // Get review counts per location
  const locationIds = (locations ?? []).map((l) => l.id);
  const reviewCounts: Record<string, { count: number; avgRating: number }> = {};

  if (locationIds.length > 0) {
    const { data: reviews } = await supabase
      .from("reviews")
      .select("location_id, star_rating")
      .in("location_id", locationIds);

    for (const r of reviews ?? []) {
      if (!r.location_id) continue;
      if (!reviewCounts[r.location_id]) {
        reviewCounts[r.location_id] = { count: 0, avgRating: 0 };
      }
      reviewCounts[r.location_id].count++;
      reviewCounts[r.location_id].avgRating += r.star_rating;
    }

    for (const id of Object.keys(reviewCounts)) {
      const entry = reviewCounts[id];
      entry.avgRating = entry.count > 0
        ? Math.round((entry.avgRating / entry.count) * 10) / 10
        : 0;
    }
  }

  return NextResponse.json({
    locations: (locations ?? []).map((l) => ({
      ...l,
      reviewCount: reviewCounts[l.id]?.count ?? 0,
      avgRating: reviewCounts[l.id]?.avgRating ?? 0,
    })),
  });
}
