"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentOrg } from "@/lib/auth/permissions";

export type SettingsActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Update organization name and slug.
 */
export async function updateOrganization(
  orgId: string,
  name: string,
  slug: string
): Promise<SettingsActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  if (!name?.trim()) return { success: false, error: "Name is required" };
  if (!slug?.trim()) return { success: false, error: "Slug is required" };

  const supabase = createAdminClient();

  // Verify user has permission (owner or admin)
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { success: false, error: "You don't have permission to update this organization" };
  }

  // Check slug uniqueness (excluding current org)
  const { data: existingSlug } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug.trim())
    .neq("id", orgId)
    .single();

  if (existingSlug) {
    return { success: false, error: "This slug is already taken" };
  }

  const { error } = await supabase
    .from("organizations")
    .update({ name: name.trim(), slug: slug.trim(), updated_at: new Date().toISOString() })
    .eq("id", orgId);

  if (error) {
    console.error("Error updating organization:", error);
    return { success: false, error: "Failed to update organization" };
  }

  return { success: true };
}

/**
 * Save brand voice configuration (upsert).
 */
export async function saveBrandVoice(
  orgId: string,
  config: {
    tone: string;
    formality: number;
    humor_level: number;
    use_emoji: boolean;
    signature_name: string | null;
    preferred_phrases: string[];
    avoid_phrases: string[];
    response_length: string;
    custom_examples: unknown | null;
    values: string[];
  }
): Promise<SettingsActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  // Verify membership
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (!membership) {
    return { success: false, error: "You are not a member of this organization" };
  }

  // Check if a brand voice config already exists for this org (no specific location)
  const { data: existing } = await supabase
    .from("brand_voice_configs")
    .select("id")
    .eq("organization_id", orgId)
    .is("location_id", null)
    .single();

  if (existing) {
    // Update
    const { error } = await supabase
      .from("brand_voice_configs")
      .update({
        tone: config.tone,
        formality: config.formality,
        humor_level: config.humor_level,
        use_emoji: config.use_emoji,
        signature_name: config.signature_name,
        preferred_phrases: config.preferred_phrases,
        avoid_phrases: config.avoid_phrases,
        response_length: config.response_length,
        custom_examples: config.custom_examples as null,
        values: config.values,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating brand voice:", error);
      return { success: false, error: "Failed to update brand voice" };
    }
  } else {
    // Insert
    const { error } = await supabase.from("brand_voice_configs").insert({
      organization_id: orgId,
      tone: config.tone,
      formality: config.formality,
      humor_level: config.humor_level,
      use_emoji: config.use_emoji,
      signature_name: config.signature_name,
      preferred_phrases: config.preferred_phrases,
      avoid_phrases: config.avoid_phrases,
      response_length: config.response_length,
      custom_examples: config.custom_examples as null,
      values: config.values,
    });

    if (error) {
      console.error("Error creating brand voice:", error);
      return { success: false, error: "Failed to save brand voice" };
    }
  }

  return { success: true };
}

/**
 * Save notification preferences (upsert).
 */
export async function saveNotificationPreferences(
  orgId: string,
  prefs: {
    new_review_email: boolean;
    new_review_in_app: boolean;
    weekly_digest: boolean;
    negative_review_alert: boolean;
  }
): Promise<SettingsActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  // Check if preferences exist
  const { data: existing } = await supabase
    .from("notification_preferences")
    .select("id")
    .eq("organization_id", orgId)
    .eq("user_id", session.user.id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("notification_preferences")
      .update({
        new_review_email: prefs.new_review_email,
        new_review_in_app: prefs.new_review_in_app,
        weekly_digest: prefs.weekly_digest,
        negative_review_alert: prefs.negative_review_alert,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Error updating notification preferences:", error);
      return { success: false, error: "Failed to update preferences" };
    }
  } else {
    const { error } = await supabase.from("notification_preferences").insert({
      user_id: session.user.id,
      organization_id: orgId,
      new_review_email: prefs.new_review_email,
      new_review_in_app: prefs.new_review_in_app,
      weekly_digest: prefs.weekly_digest,
      negative_review_alert: prefs.negative_review_alert,
    });

    if (error) {
      console.error("Error creating notification preferences:", error);
      return { success: false, error: "Failed to save preferences" };
    }
  }

  return { success: true };
}
