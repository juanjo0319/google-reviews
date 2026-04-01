import { createAdminClient } from "@/lib/supabase/admin";
import { createGBPClient } from "./client";

// Per-location write queue to respect the 10 edits/min/location limit
const locationWriteTimestamps = new Map<string, number[]>();

function canWriteToLocation(locationId: string): boolean {
  const now = Date.now();
  const timestamps = locationWriteTimestamps.get(locationId) ?? [];
  // Remove timestamps older than 1 minute
  const recent = timestamps.filter((t) => now - t < 60_000);
  locationWriteTimestamps.set(locationId, recent);
  return recent.length < 10;
}

function recordLocationWrite(locationId: string): void {
  const timestamps = locationWriteTimestamps.get(locationId) ?? [];
  timestamps.push(Date.now());
  locationWriteTimestamps.set(locationId, timestamps);
}

async function waitForLocationSlot(locationId: string): Promise<void> {
  while (!canWriteToLocation(locationId)) {
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

/**
 * Publish an approved response to Google Business Profile.
 *
 * @param responseId - The ID of the response record (must have status = "approved")
 * @param publishedByUserId - The user ID of whoever triggered the publish
 */
export async function publishResponse(
  responseId: string,
  publishedByUserId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Fetch the response record
  const { data: responseRecord, error: fetchError } = await supabase
    .from("responses")
    .select(
      `
      id, content, status, organization_id, review_id,
      reviews!inner(
        google_review_id,
        location_id,
        locations!inner(
          google_account_id,
          google_location_id,
          id
        )
      )
    `
    )
    .eq("id", responseId)
    .single();

  if (fetchError || !responseRecord) {
    return { success: false, error: "Response not found" };
  }

  if (responseRecord.status !== "approved") {
    return {
      success: false,
      error: `Response must be approved before publishing (current: ${responseRecord.status})`,
    };
  }

  // Extract Google identifiers from the joined data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const review = (responseRecord as any).reviews;
  const location = review.locations;
  const googleReviewId = review.google_review_id;
  const googleAccountId = location.google_account_id;
  const googleLocationId = location.google_location_id;
  const dbLocationId = location.id;

  if (!googleReviewId || !googleAccountId || !googleLocationId) {
    return { success: false, error: "Missing Google identifiers for this review" };
  }

  // Build the review name for the API
  const reviewName = `${googleAccountId}/${googleLocationId}/reviews/${googleReviewId}`;

  // Wait for location write slot (10 edits/min limit)
  await waitForLocationSlot(dbLocationId);

  // Attempt to publish with retries
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const gbp = await createGBPClient(responseRecord.organization_id);
      const reply = await gbp.replyToReview(reviewName, responseRecord.content);

      recordLocationWrite(dbLocationId);

      // Update response record
      await supabase
        .from("responses")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          published_google_reply_id: reply.updateTime,
          updated_at: new Date().toISOString(),
        })
        .eq("id", responseId);

      // Create audit log entry
      await supabase.from("audit_log").insert({
        organization_id: responseRecord.organization_id,
        user_id: publishedByUserId,
        action: "response.published",
        entity_type: "response",
        entity_id: responseId,
        metadata: {
          reviewName,
          content: responseRecord.content,
          publishedAt: new Date().toISOString(),
        },
      });

      return { success: true };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(
        `Publish attempt ${attempt + 1}/3 failed for response ${responseId}:`,
        lastError.message
      );

      if (attempt < 2) {
        // Exponential backoff: 2s, 4s
        await new Promise((resolve) =>
          setTimeout(resolve, 2000 * Math.pow(2, attempt))
        );
      }
    }
  }

  // All retries failed — log the error
  await supabase.from("audit_log").insert({
    organization_id: responseRecord.organization_id,
    user_id: publishedByUserId,
    action: "response.publish_failed",
    entity_type: "response",
    entity_id: responseId,
    metadata: {
      error: lastError?.message,
      attempts: 3,
    },
  });

  return {
    success: false,
    error: `Failed after 3 attempts: ${lastError?.message}`,
  };
}

/**
 * Delete a published reply from Google Business Profile.
 */
export async function deletePublishedResponse(
  responseId: string,
  deletedByUserId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Fetch the response record with review/location details
  const { data: responseRecord, error: fetchError } = await supabase
    .from("responses")
    .select(
      `
      id, content, status, organization_id, review_id,
      reviews!inner(
        google_review_id,
        location_id,
        locations!inner(
          google_account_id,
          google_location_id,
          id
        )
      )
    `
    )
    .eq("id", responseId)
    .single();

  if (fetchError || !responseRecord) {
    return { success: false, error: "Response not found" };
  }

  if (responseRecord.status !== "published") {
    return {
      success: false,
      error: "Only published responses can be deleted from Google",
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const review = (responseRecord as any).reviews;
  const location = review.locations;
  const reviewName = `${location.google_account_id}/${location.google_location_id}/reviews/${review.google_review_id}`;

  // Wait for location write slot
  await waitForLocationSlot(location.id);

  try {
    const gbp = await createGBPClient(responseRecord.organization_id);
    await gbp.deleteReply(reviewName);

    recordLocationWrite(location.id);

    // Update response record back to approved
    await supabase
      .from("responses")
      .update({
        status: "draft",
        published_at: null,
        published_google_reply_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", responseId);

    // Audit log
    await supabase.from("audit_log").insert({
      organization_id: responseRecord.organization_id,
      user_id: deletedByUserId,
      action: "response.deleted_from_google",
      entity_type: "response",
      entity_id: responseId,
      metadata: {
        reviewName,
        originalContent: responseRecord.content,
        deletedAt: new Date().toISOString(),
      },
    });

    return { success: true };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : String(err);

    await supabase.from("audit_log").insert({
      organization_id: responseRecord.organization_id,
      user_id: deletedByUserId,
      action: "response.delete_failed",
      entity_type: "response",
      entity_id: responseId,
      metadata: { error: errorMessage },
    });

    return { success: false, error: errorMessage };
  }
}
