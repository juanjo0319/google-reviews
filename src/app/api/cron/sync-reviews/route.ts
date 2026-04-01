import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncAllLocations } from "@/lib/google/sync";

export const dynamic = "force-dynamic";

/**
 * Cron endpoint: syncs reviews for all active organizations.
 * Protected by a secret token header.
 *
 * Configure as a Railway cron job running every 15 minutes:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://yourapp.up.railway.app/api/cron/sync-reviews
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (fail-closed: reject if secret is missing or mismatched)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  if (authHeader !== "Bearer " + cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Get all organizations that have connected Google tokens
  const { data: orgs } = await supabase
    .from("google_oauth_tokens")
    .select("organization_id")
    .order("updated_at", { ascending: true });

  if (!orgs?.length) {
    return NextResponse.json({ message: "No organizations to sync", synced: 0 });
  }

  // Deduplicate org IDs
  const orgIds = [...new Set(orgs.map((o) => o.organization_id))];

  const results: { orgId: string; synced: number; errors: number }[] = [];

  // Process organizations with staggered execution to avoid rate limit bursts.
  // Each org gets a 2-second gap to spread requests.
  for (const orgId of orgIds) {
    try {
      const result = await syncAllLocations(orgId);
      results.push({ orgId, synced: result.total, errors: result.errors });
    } catch (err) {
      console.error(`Cron sync failed for org ${orgId}:`, err);
      results.push({ orgId, synced: 0, errors: 1 });
    }

    // Stagger between organizations
    if (orgIds.indexOf(orgId) < orgIds.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  const totalSynced = results.reduce((sum, r) => sum + r.synced, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);

  return NextResponse.json({
    message: `Synced ${totalSynced} reviews across ${orgIds.length} organizations`,
    organizations: orgIds.length,
    totalSynced,
    totalErrors,
    results,
  });
}
