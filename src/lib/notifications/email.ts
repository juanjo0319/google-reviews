import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewReviewAlert, sendNegativeReviewAlert } from "@/lib/email/send";

const BASE_URL =
  process.env.NEXTAUTH_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

/**
 * Send email notification for a new review, checking user preferences first.
 */
export async function emailNewReview(
  orgId: string,
  review: {
    id: string;
    reviewerName: string;
    starRating: number;
    comment: string;
    sentiment?: string | null;
  }
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const supabase = createAdminClient();
  const isNegative =
    review.sentiment === "negative" || review.starRating <= 2;

  // Get org name
  const { data: org } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", orgId)
    .single();

  const businessName = org?.name ?? "Your Business";
  const reviewUrl = BASE_URL + "/dashboard/reviews/" + review.id;
  const snippet =
    review.comment.length > 200
      ? review.comment.slice(0, 200) + "..."
      : review.comment;

  // Get users with email preferences enabled
  const prefKey = isNegative ? "negative_review_alert" : "new_review_email";

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("user_id, users!inner(email)")
    .eq("organization_id", orgId)
    .eq(prefKey, true);

  if (!prefs?.length) return;

  for (const pref of prefs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const email = (pref.users as any)?.email;
    if (!email) continue;

    try {
      if (isNegative) {
        await sendNegativeReviewAlert(email, {
          businessName,
          reviewerName: review.reviewerName,
          starRating: review.starRating,
          reviewText: snippet,
          reviewUrl,
        });
      } else {
        await sendNewReviewAlert(email, {
          businessName,
          reviewerName: review.reviewerName,
          starRating: review.starRating,
          reviewSnippet: snippet,
          reviewUrl,
        });
      }
    } catch (err) {
      console.error("Failed to send review alert email to " + email + ":", err);
    }
  }
}
