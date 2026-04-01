import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWeeklyDigest } from "@/lib/email/send";

export const dynamic = "force-dynamic";

/**
 * Weekly digest cron endpoint.
 * Runs every Monday at 9am. Aggregates review data per org and sends
 * to users who have weekly_digest: true.
 *
 * Configure as a Railway cron job:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://yourapp.up.railway.app/api/cron/weekly-digest
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== "Bearer " + cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ message: "Email not configured, skipping" });
  }

  const supabase = createAdminClient();
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  // Date range: last 7 days
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get all organizations
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name");

  if (!orgs?.length) {
    return NextResponse.json({ message: "No organizations", sent: 0 });
  }

  let totalSent = 0;

  for (const org of orgs) {
    // Get users with weekly_digest enabled
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("user_id, users!inner(email, name)")
      .eq("organization_id", org.id)
      .eq("weekly_digest", true);

    if (!prefs?.length) continue;

    // Aggregate review data for this org
    const { data: weekReviews } = await supabase
      .from("reviews")
      .select("star_rating, sentiment, comment")
      .eq("organization_id", org.id)
      .gte("created_at", weekAgo.toISOString())
      .lte("created_at", now.toISOString());

    const reviews = weekReviews ?? [];
    if (reviews.length === 0) continue;

    const totalNewReviews = reviews.length;

    // Average rating
    const avgRating =
      reviews.reduce((sum, r) => sum + r.star_rating, 0) / reviews.length;

    // Sentiment breakdown
    const sentimentBreakdown = { positive: 0, neutral: 0, negative: 0 };
    for (const r of reviews) {
      const s = r.sentiment as keyof typeof sentimentBreakdown;
      if (s in sentimentBreakdown) sentimentBreakdown[s]++;
    }

    // Top positive quote
    const positiveReviews = reviews.filter(
      (r) => r.sentiment === "positive" && r.comment
    );
    const topPositiveQuote =
      positiveReviews.length > 0
        ? positiveReviews[0].comment!.slice(0, 150)
        : null;

    // Most urgent negative review
    const negativeReviews = reviews.filter(
      (r) => r.sentiment === "negative" && r.comment
    );
    const urgentNegativeSnippet =
      negativeReviews.length > 0
        ? negativeReviews[0].comment!.slice(0, 150)
        : null;

    // Response rate
    const { count: respondedCount } = await supabase
      .from("responses")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", org.id)
      .in("status", ["published", "approved", "pending_approval"]);

    const responseRate =
      totalNewReviews > 0
        ? Math.round(((respondedCount ?? 0) / totalNewReviews) * 100) + "%"
        : "N/A";

    // Send to each user
    for (const pref of prefs) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = pref.users as any;
      if (!user?.email) continue;

      try {
        await sendWeeklyDigest(user.email, {
          businessName: org.name,
          totalNewReviews,
          averageRating: avgRating.toFixed(1),
          sentimentBreakdown,
          topPositiveQuote,
          urgentNegativeSnippet,
          responseRate,
          dashboardUrl: baseUrl + "/dashboard",
        });
        totalSent++;
      } catch (err) {
        console.error(
          "Failed to send weekly digest to " + user.email + ":",
          err
        );
      }
    }
  }

  return NextResponse.json({
    message: "Weekly digest sent to " + totalSent + " users",
    sent: totalSent,
  });
}
