import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdmin } from "./superadmin";

/**
 * Require authentication. Redirects to /login if not authenticated.
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
 * Superadmins always pass as "owner".
 */
export async function requireOrgRole(
  orgId: string,
  roles: ("owner" | "admin" | "member")[]
) {
  const session = await requireAuth();

  if (isSuperAdmin(session.user.email)) {
    return { session, role: "owner" as const };
  }

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
 * Superadmins can access any org via the active_org_id cookie.
 */
export async function getCurrentOrg() {
  const session = await requireAuth();
  const cookieStore = await cookies();
  const activeOrgId = cookieStore.get("active_org_id")?.value;
  const supabase = createAdminClient();
  const superAdmin = isSuperAdmin(session.user.email);

  if (activeOrgId) {
    if (superAdmin) {
      // Superadmin: access any org directly, no membership check
      const { data: org } = await supabase
        .from("organizations")
        .select("id, name, slug")
        .eq("id", activeOrgId)
        .single();

      if (org) {
        return {
          orgId: org.id,
          role: "owner",
          organization: org,
        };
      }
    } else {
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
 * Superadmins see ALL organizations.
 */
export async function getUserOrganizations() {
  const session = await requireAuth();
  const supabase = createAdminClient();

  if (isSuperAdmin(session.user.email)) {
    const { data: orgs } = await supabase
      .from("organizations")
      .select("id, name, slug, plan_tier")
      .order("created_at", { ascending: true });

    return (orgs ?? []).map((org) => ({
      orgId: org.id,
      role: "owner",
      organization: org,
    }));
  }

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
