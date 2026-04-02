"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireOrgAdmin } from "@/lib/auth/guards";
import { publishResponse, deletePublishedResponse } from "@/lib/google/publish";

type ActionResult = { success: boolean; error?: string };

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

  // Use centralized guard instead of manual membership check
  try {
    await requireOrgAdmin(response.organization_id);
  } catch {
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

  // Use centralized guard instead of manual membership check
  try {
    await requireOrgAdmin(response.organization_id);
  } catch {
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
