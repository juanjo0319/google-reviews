"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrgAdmin } from "@/lib/auth/guards";
import { Resend } from "resend";

import type { OrgActionResult } from "./lifecycle";

export type { OrgActionResult };

export async function inviteMember(
  orgId: string,
  email: string,
  role: "admin" | "member" = "member"
): Promise<OrgActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    await requireOrgAdmin(orgId);
  } catch {
    return { success: false, error: "You don't have permission to invite members" };
  }

  const supabase = createAdminClient();

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

  try {
    await requireOrgAdmin(orgId);
  } catch {
    return { success: false, error: "You don't have permission to change roles" };
  }

  const supabase = createAdminClient();

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

  try {
    await requireOrgAdmin(orgId);
  } catch {
    return { success: false, error: "You don't have permission to remove members" };
  }

  const supabase = createAdminClient();

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
