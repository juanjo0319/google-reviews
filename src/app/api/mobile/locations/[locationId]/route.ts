import { NextRequest, NextResponse } from "next/server";
import {
  authenticateMobile,
  requireMobileOrgAdmin,
} from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ locationId: string }> };

/**
 * DELETE /api/mobile/locations/[locationId] — remove a location
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { locationId } = await params;
  const supabase = createAdminClient();

  const { data: location } = await supabase
    .from("locations")
    .select("id, organization_id, name")
    .eq("id", locationId)
    .single();

  if (!location) {
    return NextResponse.json({ error: "Location not found" }, { status: 404 });
  }

  const adminCheck = await requireMobileOrgAdmin(
    session.userId,
    location.organization_id
  );
  if (adminCheck instanceof NextResponse) return adminCheck;

  const { error } = await supabase.from("locations").delete().eq("id", locationId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }

  await supabase.from("audit_log").insert({
    organization_id: location.organization_id,
    user_id: session.userId,
    action: "location.deleted",
    entity_type: "location",
    entity_id: locationId,
    metadata: { name: location.name },
  });

  return NextResponse.json({ success: true });
}
