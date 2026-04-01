import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Require authentication. Redirects to /login if not authenticated.
 * Returns the session (never null).
 */
export async function requireAuth() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session;
}

/**
 * Require the current user to have one of the specified roles in the given org.
 * Throws a 403-style redirect if the user lacks the required role.
 */
export async function requireOrgRole(
  orgId: string,
  roles: ("owner" | "admin" | "member")[]
) {
  const session = await requireAuth();
  const supabase = createAdminClient();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (!membership || !roles.includes(membership.role as "owner" | "admin" | "member")) {
    throw new Error("Forbidden: insufficient role");
  }

  return { session, role: membership.role };
}

/**
 * Get the current user's active organization ID.
 * Reads from the active_org_id cookie, falling back to the user's first org.
 */
export async function getCurrentOrg() {
  const session = await requireAuth();
  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get("active_org_id")?.value;
  const supabase = createAdminClient();

  if (activeOrgId) {
    // Verify user is actually a member of this org
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id, role, organizations(id, name, slug)")
      .eq("organization_id", activeOrgId)
      .eq("user_id", session.user.id)
      .single();

    if (membership) {
      return {
        orgId: membership.organization_id,
        role: membership.role,
        organization: membership.organizations as unknown as {
          id: string;
          name: string;
          slug: string;
        },
      };
    }
  }

  // Fallback: get user's first org
  const { data: firstMembership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, slug)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!firstMembership) return null;

  return {
    orgId: firstMembership.organization_id,
    role: firstMembership.role,
    organization: firstMembership.organizations as unknown as {
      id: string;
      name: string;
      slug: string;
    },
  };
}

/**
 * Get all organizations the current user belongs to.
 */
export async function getUserOrganizations() {
  const session = await requireAuth();
  const supabase = createAdminClient();

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, slug, plan_tier)")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });

  return (memberships ?? []).map((m) => ({
    orgId: m.organization_id,
    role: m.role,
    organization: m.organizations as unknown as {
      id: string;
      name: string;
      slug: string;
      plan_tier: string;
    },
  }));
}
