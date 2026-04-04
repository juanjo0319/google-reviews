import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncReviewsForLocation } from "@/lib/google/sync";

/**
 * POST /api/mobile/locations/sync — trigger review sync for a location or all org locations
 */
export async function POST(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const orgId: string | undefined = body.orgId;
  const locationId: string | undefined = body.locationId;

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = createAdminClient();

  let locationsToSync: { id: string; name: string }[] = [];

  if (locationId) {
    const { data: loc } = await supabase
      .from("locations")
      .select("id, name")
      .eq("id", locationId)
      .eq("organization_id", orgId)
      .single();

    if (!loc) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }
    locationsToSync = [loc];
  } else {
    const { data: locs } = await supabase
      .from("locations")
      .select("id, name")
      .eq("organization_id", orgId);

    locationsToSync = locs ?? [];
  }

  if (locationsToSync.length === 0) {
    return NextResponse.json({ error: "No locations to sync" }, { status: 404 });
  }

  // Trigger sync (non-blocking)
  for (const loc of locationsToSync) {
    syncReviewsForLocation(orgId, loc.id).catch((err) =>
      console.error(`Sync failed for location ${loc.id}:`, err)
    );
  }

  return NextResponse.json({
    success: true,
    message: `Syncing ${locationsToSync.length} location(s)`,
    locations: locationsToSync.map((l) => l.name),
  });
}
