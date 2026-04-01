"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReviewResponse } from "@/lib/ai/generate-response";
import { publishResponse, deletePublishedResponse } from "@/lib/google/publish";

type ActionResult = { success: boolean; error?: string };

// --- Single review response actions ---

export async function submitForApproval(responseId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: response } = await supabase
    .from("responses")
    .select("id, status, organization_id")
    .eq("id", responseId)
    .single();

  if (!response) return { success: false, error: "Response not found" };
  if (response.status !== "draft") {
    return { success: false, error: "Only draft responses can be submitted" };
  }

  await supabase
    .from("responses")
    .update({ status: "pending_approval", updated_at: new Date().toISOString() })
    .eq("id", responseId);

  await supabase.from("audit_log").insert({
    organization_id: response.organization_id,
    user_id: session.user.id,
    action: "response.submitted_for_approval",
    entity_type: "response",
    entity_id: responseId,
  });

  return { success: true };
}

export async function approveResponse(responseId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: response } = await supabase
    .from("responses")
    .select("id, status, organization_id")
    .eq("id", responseId)
    .single();

  if (!response) return { success: false, error: "Response not found" };

  // Verify caller is admin/owner
  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", response.organization_id)
    .eq("user_id", session.user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { success: false, error: "Only admins and owners can approve responses" };
  }

  await supabase
    .from("responses")
    .update({
      status: "approved",
      approved_by: session.user.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", responseId);

  await supabase.from("audit_log").insert({
    organization_id: response.organization_id,
    user_id: session.user.id,
    action: "response.approved",
    entity_type: "response",
    entity_id: responseId,
  });

  return { success: true };
}

export async function rejectResponse(
  responseId: string,
  note?: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: response } = await supabase
    .from("responses")
    .select("id, status, organization_id")
    .eq("id", responseId)
    .single();

  if (!response) return { success: false, error: "Response not found" };

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", response.organization_id)
    .eq("user_id", session.user.id)
    .single();

  if (!membership || !["owner", "admin"].includes(membership.role)) {
    return { success: false, error: "Only admins and owners can reject responses" };
  }

  await supabase
    .from("responses")
    .update({
      status: "rejected",
      updated_at: new Date().toISOString(),
    })
    .eq("id", responseId);

  await supabase.from("audit_log").insert({
    organization_id: response.organization_id,
    user_id: session.user.id,
    action: "response.rejected",
    entity_type: "response",
    entity_id: responseId,
    metadata: note ? { note } : null,
  });

  return { success: true };
}

export async function publishResponseAction(responseId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  return publishResponse(responseId, session.user.id);
}

export async function deletePublishedResponseAction(responseId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  return deletePublishedResponse(responseId, session.user.id);
}

export async function updateResponseContent(
  responseId: string,
  content: string
): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: response } = await supabase
    .from("responses")
    .select("id, status, organization_id")
    .eq("id", responseId)
    .single();

  if (!response) return { success: false, error: "Response not found" };
  if (response.status !== "draft") {
    return { success: false, error: "Only draft responses can be edited" };
  }

  await supabase
    .from("responses")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", responseId);

  return { success: true };
}

export async function discardResponse(responseId: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: response } = await supabase
    .from("responses")
    .select("id, status, organization_id")
    .eq("id", responseId)
    .single();

  if (!response) return { success: false, error: "Response not found" };
  if (!["draft", "rejected"].includes(response.status)) {
    return { success: false, error: "Cannot discard this response" };
  }

  await supabase.from("responses").delete().eq("id", responseId);

  await supabase.from("audit_log").insert({
    organization_id: response.organization_id,
    user_id: session.user.id,
    action: "response.discarded",
    entity_type: "response",
    entity_id: responseId,
  });

  return { success: true };
}

export async function saveManualResponse(
  reviewId: string,
  content: string
): Promise<ActionResult & { responseId?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  const { data: review } = await supabase
    .from("reviews")
    .select("id, organization_id")
    .eq("id", reviewId)
    .single();

  if (!review) return { success: false, error: "Review not found" };

  const { data: response, error } = await supabase
    .from("responses")
    .insert({
      review_id: reviewId,
      organization_id: review.organization_id,
      content,
      status: "draft",
      is_ai_generated: false,
      created_by: session.user.id,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: "Failed to save response" };

  return { success: true, responseId: response.id };
}

// --- Bulk operations ---

export async function bulkGenerateResponses(
  reviewIds: string[]
): Promise<ActionResult & { generated?: number; failed?: number }> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  let generated = 0;
  let failed = 0;
  const queue = [...reviewIds];
  const CONCURRENCY = 5;

  async function worker() {
    while (queue.length > 0) {
      const reviewId = queue.shift();
      if (!reviewId) break;
      try {
        await generateReviewResponse(reviewId, {
          createdByUserId: session!.user.id,
        });
        generated++;
      } catch (err) {
        console.error("Bulk generation failed for " + reviewId + ":", err);
        failed++;
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, reviewIds.length) },
    () => worker()
  );
  await Promise.all(workers);

  return { success: true, generated, failed };
}

export async function bulkMarkAsRead(reviewIds: string[]): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const supabase = createAdminClient();

  await supabase
    .from("reviews")
    .update({ updated_at: new Date().toISOString() })
    .in("id", reviewIds);

  return { success: true };
}
