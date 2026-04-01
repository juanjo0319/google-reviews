import { createAdminClient } from "@/lib/supabase/admin";
import {
  createGBPClient,
  mapStarRating,
  type GoogleReview,
} from "./client";
import { analyzeAndUpdateReview } from "@/lib/ai/analyze-review";

/**
 * Sync reviews for a single location.
 * Fetches reviews ordered by updateTime desc and upserts new/updated ones.
 */
export async function syncReviewsForLocation(
  organizationId: string,
  locationId: string
): Promise<{ synced: number; errors: number }> {
  const supabase = createAdminClient();

  // Get location details
  const { data: location } = await supabase
    .from("locations")
    .select(
      "id, google_account_id, google_location_id, last_synced_at, organization_id"
    )
    .eq("id", locationId)
    .single();

  if (!location || !location.google_account_id || !location.google_location_id) {
    throw new Error(`Location ${locationId} not found or not linked to Google`);
  }

  const gbp = await createGBPClient(organizationId);

  let synced = 0;
  let errors = 0;
  let pageToken: string | undefined;

  // Paginate through reviews
  do {
    const response = await gbp.listReviews(
      location.google_account_id,
      location.google_location_id,
      50,
      pageToken,
      "updateTime desc"
    );

    if (!response.reviews?.length) break;

    for (const review of response.reviews) {
      try {
        const reviewId = await upsertReview(supabase, review, location.id, organizationId);
        synced++;
        // Trigger AI sentiment analysis (non-blocking)
        if (reviewId) {
          analyzeAndUpdateReview(reviewId, organizationId).catch((err) =>
            console.error(`Sentiment analysis failed for ${reviewId}:`, err)
          );
        }
      } catch (err) {
        console.error(`Error upserting review ${review.reviewId}:`, err);
        errors++;
      }
    }

    pageToken = response.nextPageToken;

    // If we have a last_synced_at and the oldest review in this page is older,
    // we can stop — we've already synced these
    if (location.last_synced_at && response.reviews.length > 0) {
      const oldestInPage = response.reviews[response.reviews.length - 1];
      if (
        new Date(oldestInPage.updateTime) <
        new Date(location.last_synced_at)
      ) {
        break;
      }
    }
  } while (pageToken);

  // Update last_synced_at
  await supabase
    .from("locations")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", locationId);

  return { synced, errors };
}

/**
 * Sync reviews for all locations in an organization.
 */
export async function syncAllLocations(
  organizationId: string
): Promise<{ total: number; errors: number }> {
  const supabase = createAdminClient();

  const { data: locations } = await supabase
    .from("locations")
    .select("id")
    .eq("organization_id", organizationId)
    .not("google_location_id", "is", null);

  if (!locations?.length) return { total: 0, errors: 0 };

  let total = 0;
  let errors = 0;

  // Process sequentially to respect rate limits
  for (const location of locations) {
    try {
      const result = await syncReviewsForLocation(
        organizationId,
        location.id
      );
      total += result.synced;
      errors += result.errors;
    } catch (err) {
      console.error(
        `Sync failed for location ${location.id}:`,
        err
      );
      errors++;
    }

    // Small delay between locations to avoid rate limit bursts
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return { total, errors };
}

/**
 * Upsert a single Google review into the database.
 * Deduplicates via the google_review_id unique constraint.
 */
async function upsertReview(
  supabase: ReturnType<typeof createAdminClient>,
  review: GoogleReview,
  locationId: string,
  organizationId: string
): Promise<string | null> {
  const starRating = mapStarRating(review.starRating);

  const { data } = await supabase
    .from("reviews")
    .upsert(
      {
        location_id: locationId,
        organization_id: organizationId,
        google_review_id: review.reviewId,
        reviewer_name: review.reviewer.displayName,
        reviewer_photo_url: review.reviewer.profilePhotoUrl ?? null,
        star_rating: starRating,
        comment: review.comment ?? null,
        review_created_at: review.createTime,
        review_updated_at: review.updateTime,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "google_review_id" }
    )
    .select("id")
    .single();

  return data?.id ?? null;
}

/**
 * Sync a single review by its Google review name.
 * Used by the Pub/Sub webhook handler.
 */
export async function syncSingleReview(
  organizationId: string,
  googleAccountId: string,
  googleLocationId: string,
  reviewName: string
): Promise<void> {
  const supabase = createAdminClient();

  // Find the location
  const { data: location } = await supabase
    .from("locations")
    .select("id")
    .eq("organization_id", organizationId)
    .eq("google_account_id", googleAccountId)
    .eq("google_location_id", googleLocationId)
    .single();

  if (!location) {
    console.warn(
      `Location not found for ${googleAccountId}/${googleLocationId}`
    );
    return;
  }

  // Fetch the full review from Google
  const gbp = await createGBPClient(organizationId);
  const review = await gbp.getReview(reviewName);

  await upsertReview(supabase, review, location.id, organizationId);
}
