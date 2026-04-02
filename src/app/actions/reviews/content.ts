"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type ActionResult = { success: boolean; error?: string };

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
