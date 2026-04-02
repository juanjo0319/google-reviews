"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

export type OrgActionResult = {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Ensure the current user has at least one organization.
 * Creates a personal org if none exist. Called on first dashboard visit.
 */
export async function ensureOrganization() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const supabase = createAdminClient();

  // Check if user already has any org
  const { data: existing } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", session.user.id)
    .limit(1)
    .single();

  if (existing) {
    return existing.organization_id;
  }

  // Create personal organization
  const orgName = session.user.name
    ? `${session.user.name}'s Organization`
    : "My Organization";

  const baseSlug = slugify(orgName);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName, slug })
    .select("id")
    .single();

  if (orgError || !org) {
    console.error("Error creating organization:", orgError);
    throw new Error("Failed to create organization");
  }

  // Add user as owner
  const { error: memberError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: org.id,
      user_id: session.user.id,
      role: "owner",
    });

  if (memberError) {
    console.error("Error adding org member:", memberError);
    throw new Error("Failed to set up organization membership");
  }

  // Create default notification preferences
  await supabase.from("notification_preferences").insert({
    user_id: session.user.id,
    organization_id: org.id,
  });

  return org.id;
}

export async function createOrganization(
  _prev: OrgActionResult | null,
  formData: FormData
): Promise<OrgActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const name = formData.get("name") as string;
  if (!name?.trim()) return { success: false, error: "Organization name is required" };

  const supabase = createAdminClient();
  const baseSlug = slugify(name);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({ name: name.trim(), slug })
    .select("id, slug")
    .single();

  if (error) {
    console.error("Error creating organization:", error);
    return { success: false, error: "Failed to create organization" };
  }

  // Add creator as owner
  await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: session.user.id,
    role: "owner",
  });

  // Create default notification preferences
  await supabase.from("notification_preferences").insert({
    user_id: session.user.id,
    organization_id: org.id,
  });

  return { success: true, data: { id: org.id, slug: org.slug } };
}

export async function switchOrganization(orgId: string): Promise<OrgActionResult> {
  const { isSuperAdmin } = await import("@/lib/auth/superadmin");
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  // Superadmins can switch to any org
  if (!isSuperAdmin(session.user.email)) {
    const supabase = createAdminClient();
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id")
      .eq("organization_id", orgId)
      .eq("user_id", session.user.id)
      .single();

    if (!membership) {
      return { success: false, error: "You are not a member of this organization" };
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("active_org_id", orgId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return { success: true };
}
