"use server";

import { auth } from "@/lib/auth";
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

export async function connectLocations(
  orgId: string,
  locations: LocationInput[]
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  // Verify user is owner/admin of this org
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { success: false, error: "Insufficient permissions" };
  }

  // Insert locations
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
    console.error("Error inserting locations:", insertError);
    return { success: false, error: "Failed to save locations" };
  }

  // Trigger initial review sync for each new location (non-blocking)
  for (const loc of locations) {
    const { data: locationRecord } = await supabase
      .from("locations")
      .select("id")
      .eq("organization_id", orgId)
      .eq("google_location_id", loc.googleLocationId)
      .single();

    if (locationRecord) {
      // Fire and forget — don't block the UI
      syncReviewsForLocation(orgId, locationRecord.id).catch((err) =>
        console.error(
          `Initial sync failed for location ${locationRecord.id}:`,
          err
        )
      );
    }
  }

  // Create audit log entry
  await supabase.from("audit_log").insert({
    organization_id: orgId,
    user_id: session.user.id,
    action: "locations.connected",
    entity_type: "location",
    metadata: {
      count: locations.length,
      names: locations.map((l) => l.name),
    },
  });

  return { success: true };
}
