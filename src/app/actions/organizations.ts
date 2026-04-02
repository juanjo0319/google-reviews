"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { Resend } from "resend";

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

export type OrgActionResult = {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
};

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

export async function inviteMember(
  orgId: string,
  email: string,
  role: "admin" | "member" = "member"
): Promise<OrgActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  // Verify caller is owner or admin
  const { data: callerMembership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (
    !callerMembership ||
    !["owner", "admin"].includes(callerMembership.role)
  ) {
    return { success: false, error: "You don't have permission to invite members" };
  }

  // Look up invited user
  const { data: invitedUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (invitedUser) {
    // User exists — add directly
    const { error } = await supabase.from("organization_members").insert({
      organization_id: orgId,
      user_id: invitedUser.id,
      role,
    });

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "This user is already a member" };
      }
      return { success: false, error: "Failed to add member" };
    }
  }

  // Send invite email
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", orgId)
        .single();

      const baseUrl =
        process.env.NEXTAUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000";

      await resend.emails.send({
        from:
          process.env.RESEND_FROM_EMAIL ?? "ReviewAI <noreply@reviewai.app>",
        to: email,
        subject: `You've been invited to ${org?.name ?? "an organization"} on ReviewAI`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>You've been invited!</h2>
            <p>${session.user.name ?? "A team member"} invited you to join <strong>${org?.name}</strong> on ReviewAI.</p>
            <a href="${baseUrl}/signup"
               style="display: inline-block; background: #1a73e8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              ${invitedUser ? "Go to Dashboard" : "Create Account"}
            </a>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending invite email:", error);
    }
  }

  return { success: true };
}

export async function updateMemberRole(
  orgId: string,
  targetUserId: string,
  newRole: "admin" | "member"
): Promise<OrgActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  // Verify caller is owner or admin
  const { data: callerMembership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (
    !callerMembership ||
    !["owner", "admin"].includes(callerMembership.role)
  ) {
    return { success: false, error: "You don't have permission to change roles" };
  }

  // Can't change owner role via this action
  const { data: targetMembership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", targetUserId)
    .single();

  if (!targetMembership) {
    return { success: false, error: "User is not a member of this organization" };
  }

  if (targetMembership.role === "owner") {
    return { success: false, error: "Cannot change the owner's role" };
  }

  const { error } = await supabase
    .from("organization_members")
    .update({ role: newRole })
    .eq("organization_id", orgId)
    .eq("user_id", targetUserId);

  if (error) {
    return { success: false, error: "Failed to update role" };
  }

  return { success: true };
}

export async function removeMember(
  orgId: string,
  targetUserId: string
): Promise<OrgActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  // Verify caller is owner or admin
  const { data: callerMembership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (
    !callerMembership ||
    !["owner", "admin"].includes(callerMembership.role)
  ) {
    return { success: false, error: "You don't have permission to remove members" };
  }

  // Can't remove the owner
  const { data: targetMembership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", targetUserId)
    .single();

  if (!targetMembership) {
    return { success: false, error: "User is not a member of this organization" };
  }

  if (targetMembership.role === "owner") {
    return { success: false, error: "Cannot remove the organization owner" };
  }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", targetUserId);

  if (error) {
    return { success: false, error: "Failed to remove member" };
  }

  return { success: true };
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
