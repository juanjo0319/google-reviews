"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type OnboardingActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Mark the current user's onboarding as complete.
 */
export async function completeOnboarding(): Promise<OnboardingActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("users")
    .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
    .eq("id", session.user.id);

  if (error) {
    console.error("Error completing onboarding:", error);
    return { success: false, error: "Failed to complete onboarding" };
  }

  return { success: true };
}

/**
 * Update an organization's name (used in onboarding step 1).
 */
export async function updateOrgName(
  orgId: string,
  name: string
): Promise<OnboardingActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (!name?.trim()) return { success: false, error: "Organization name is required" };

  const supabase = createAdminClient();

  // Verify user is a member of this org
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (!membership) {
    return { success: false, error: "You are not a member of this organization" };
  }

  const { error } = await supabase
    .from("organizations")
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", orgId);

  if (error) {
    console.error("Error updating org name:", error);
    return { success: false, error: "Failed to update organization name" };
  }

  return { success: true };
}

/**
 * Quick brand voice setup used during onboarding (step 2).
 * Creates or updates the org-level brand_voice_configs record.
 */
export async function saveBrandVoiceQuick(
  orgId: string,
  tone: string,
  formality: number,
  useEmoji: boolean,
  signatureName: string
): Promise<OnboardingActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  // Verify user is a member
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (!membership) {
    return { success: false, error: "You are not a member of this organization" };
  }

  // Check if config already exists for this org (no specific location)
  const { data: existing } = await supabase
    .from("brand_voice_configs")
    .select("id")
    .eq("organization_id", orgId)
    .is("location_id", null)
    .single();

  const configData = {
    tone,
    formality,
    use_emoji: useEmoji,
    signature_name: signatureName || null,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("brand_voice_configs")
      .update(configData)
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating brand voice:", error);
      return { success: false, error: "Failed to update brand voice" };
    }
  } else {
    const { error } = await supabase.from("brand_voice_configs").insert({
      organization_id: orgId,
      ...configData,
    });

    if (error) {
      console.error("Error creating brand voice:", error);
      return { success: false, error: "Failed to save brand voice" };
    }
  }

  return { success: true };
}
