import { createAdminClient } from "@/lib/supabase/admin";
import { analyzeReviewSentiment } from "./sentiment";

/**
 * Orchestrator: analyze a review's sentiment and update the database.
 * Called after a new review is synced.
 *
 * Flow: fetch review → analyze sentiment → update review record → notify if negative
 */
export async function analyzeAndUpdateReview(
  reviewId: string,
  orgId: string
): Promise<void> {
  const supabase = createAdminClient();

  // Fetch the review
  const { data: review, error } = await supabase
    .from("reviews")
    .select("id, comment, star_rating, organization_id, location_id")
    .eq("id", reviewId)
    .single();

  if (error || !review) {
    console.error(`Review ${reviewId} not found:`, error);
    return;
  }

  // Skip if no comment text to analyze
  if (!review.comment?.trim()) {
    // Still set basic sentiment from star rating
    const sentiment =
      review.star_rating >= 4
        ? "positive"
        : review.star_rating >= 3
        ? "neutral"
        : "negative";

    await supabase
      .from("reviews")
      .update({
        sentiment,
        sentiment_score: review.star_rating / 5,
        sentiment_themes: [],
        ai_analysis: { source: "star_rating_only" },
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    return;
  }

  try {
    // Analyze sentiment
    const result = await analyzeReviewSentiment(
      review.comment,
      review.star_rating,
      orgId,
      reviewId
    );

    // Update the review record
    await supabase
      .from("reviews")
      .update({
        sentiment: result.sentiment,
        sentiment_score: result.confidence,
        sentiment_themes: result.key_themes,
        requires_urgent_response: result.requires_urgent_response,
        is_spam: result.is_spam,
        ai_analysis: {
          ...result,
          analyzed_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    // Create notification for negative reviews
    if (
      result.sentiment === "negative" ||
      result.requires_urgent_response
    ) {
      // Get org members with negative_review_alert enabled
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("user_id")
        .eq("organization_id", orgId)
        .eq("negative_review_alert", true);

      if (prefs?.length) {
        const notifications = prefs.map((p) => ({
          user_id: p.user_id,
          organization_id: orgId,
          type: result.requires_urgent_response
            ? "urgent_review"
            : "negative_review",
          title: result.requires_urgent_response
            ? "Urgent: Negative Review Requires Attention"
            : "New Negative Review",
          message: `A ${review.star_rating}-star review needs your attention.`,
          data: {
            reviewId,
            sentiment: result.sentiment,
            themes: result.key_themes,
          },
        }));

        await supabase.from("notifications").insert(notifications);
      }
    }
  } catch (err) {
    console.error(
      `Sentiment analysis failed for review ${reviewId}:`,
      err
    );
    // Don't throw — we don't want to block the sync pipeline
  }
}
