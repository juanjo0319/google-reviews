import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgAdmin } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncReviewsForLocation } from "@/lib/google/sync";

interface LocationInput {
  googleAccountId: string;
  googleLocationId: string;
  name: string;
  address: string;
  phone: string | null;
  googlePlaceId: string | null;
}

/**
 * POST /api/mobile/locations/connect — connect Google Business locations
 */
export async function POST(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const orgId: string | undefined = body.orgId;
  const locations: LocationInput[] | undefined = body.locations;

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }
  if (!locations?.length) {
    return NextResponse.json(
      { error: "At least one location is required" },
      { status: 400 }
    );
  }

  const adminCheck = await requireMobileOrgAdmin(session.userId, orgId);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const supabase = createAdminClient();

  const rows = locations.map((loc) => ({
    organization_id: orgId,
    google_account_id: loc.googleAccountId,
    google_location_id: loc.googleLocationId,
    name: loc.name,
    address: loc.address,
    phone: loc.phone,
    google_place_id: loc.googlePlaceId,
    is_verified: true,
  }));

  const { error: insertError } = await supabase
    .from("locations")
    .upsert(rows, { onConflict: "organization_id,google_location_id" });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to save locations" },
      { status: 500 }
    );
  }

  // Trigger initial review sync (non-blocking)
  for (const loc of locations) {
    const { data: locationRecord } = await supabase
      .from("locations")
      .select("id")
      .eq("organization_id", orgId)
      .eq("google_location_id", loc.googleLocationId)
      .single();

    if (locationRecord) {
      syncReviewsForLocation(orgId, locationRecord.id).catch((err) =>
        console.error(
          `Initial sync failed for location ${locationRecord.id}:`,
          err
        )
      );
    }
  }

  await supabase.from("audit_log").insert({
    organization_id: orgId,
    user_id: session.userId,
    action: "locations.connected",
    entity_type: "location",
    metadata: {
      count: locations.length,
      names: locations.map((l) => l.name),
    },
  });

  return NextResponse.json(
    { success: true, count: locations.length },
    { status: 201 }
  );
}
