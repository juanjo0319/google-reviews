"use server";

import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReviewResponse } from "@/lib/ai/generate-response";

type ActionResult = { success: boolean; error?: string };

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
