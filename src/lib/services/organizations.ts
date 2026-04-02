import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Get an organization by ID.
 */
export async function getOrgById(orgId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, slug, plan_tier")
    .eq("id", orgId)
    .single();
  return data;
}

/**
 * Update org fields.
 */
export async function updateOrg(orgId: string, data: { name?: string; slug?: string }) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("organizations")
    .update(data)
    .eq("id", orgId);
  if (error) throw new Error("Failed to update organization");
}

/**
 * Get all members of an organization.
 */
export async function getOrgMembers(orgId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organization_members")
    .select("user_id, role, users(id, name, email, image)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

/**
 * Check whether an org has any connected locations.
 */
export async function hasConnectedLocations(orgId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("locations")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId);
  return (count ?? 0) > 0;
}

/**
 * Check whether an org has Google OAuth tokens stored.
 */
export async function hasGoogleTokens(orgId: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { count } = await supabase
    .from("google_oauth_tokens")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId);
  return (count ?? 0) > 0;
}
