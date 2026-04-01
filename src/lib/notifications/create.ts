import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/types";

/**
 * Create an in-app notification for a user.
 */
export async function createNotification(
  userId: string,
  orgId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown> | null
): Promise<void> {
  const supabase = createAdminClient();

  await supabase.from("notifications").insert({
    user_id: userId,
    organization_id: orgId,
    type,
    title,
    message,
    data: (data ?? null) as Json,
  });
}

/**
 * Create notifications for all members of an org who have a specific
 * notification preference enabled.
 */
export async function notifyOrgMembers(
  orgId: string,
  prefKey: "new_review_in_app" | "negative_review_alert",
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown> | null
): Promise<void> {
  const supabase = createAdminClient();

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("user_id")
    .eq("organization_id", orgId)
    .eq(prefKey, true);

  if (!prefs?.length) return;

  const notifications = prefs.map((p) => ({
    user_id: p.user_id,
    organization_id: orgId,
    type,
    title,
    message,
    data: (data ?? null) as Json,
  }));

  await supabase.from("notifications").insert(notifications);
}

// --- Trigger functions for specific events ---

export async function notifyNewReviewSynced(
  orgId: string,
  reviewerName: string,
  starRating: number,
  reviewId: string
): Promise<void> {
  await notifyOrgMembers(
    orgId,
    "new_review_in_app",
    "new_review",
    "New Review",
    starRating + "-star review from " + reviewerName,
    { reviewId, starRating, reviewerName }
  );
}

export async function notifyResponseApproved(
  orgId: string,
  createdByUserId: string,
  responseId: string,
  reviewId: string,
  approverName: string
): Promise<void> {
  await createNotification(
    createdByUserId,
    orgId,
    "response_approved",
    "Response Approved",
    approverName + " approved your response draft.",
    { responseId, reviewId }
  );
}

export async function notifyResponsePublished(
  orgId: string,
  reviewId: string,
  responseId: string
): Promise<void> {
  await notifyOrgMembers(
    orgId,
    "new_review_in_app",
    "response_published",
    "Response Published",
    "A response was published to Google.",
    { responseId, reviewId }
  );
}

export async function notifyTeamMemberJoined(
  orgId: string,
  newMemberName: string
): Promise<void> {
  const supabase = createAdminClient();

  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", orgId);

  if (!members?.length) return;

  const notifications = members.map((m) => ({
    user_id: m.user_id,
    organization_id: orgId,
    type: "team_member_joined",
    title: "New Team Member",
    message: newMemberName + " joined the organization.",
    data: { memberName: newMemberName } as Json,
  }));

  await supabase.from("notifications").insert(notifications);
}
