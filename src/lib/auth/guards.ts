import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdmin } from "./superadmin";

/**
 * Require authenticated user. Returns session or throws.
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  return session;
}

/**
 * Require user to be owner or admin of the given org.
 * Superadmins always pass. Returns the user's role.
 */
export async function requireOrgAdmin(orgId: string): Promise<string> {
  const session = await requireUser();
  if (isSuperAdmin(session.user.email)) return "owner";

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (!data || !["owner", "admin"].includes(data.role)) {
    throw new Error("Insufficient permissions");
  }
  return data.role;
}

/**
 * Require user to be a member of the org (any role).
 */
export async function requireOrgMember(orgId: string): Promise<string> {
  const session = await requireUser();
  if (isSuperAdmin(session.user.email)) return "owner";

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (!data) throw new Error("Not a member of this organization");
  return data.role;
}
