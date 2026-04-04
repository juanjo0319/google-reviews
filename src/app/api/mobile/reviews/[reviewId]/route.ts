import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ reviewId: string }> };

/**
 * GET /api/mobile/reviews/[reviewId] — get full review with responses
 */
export async function GET(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { reviewId } = await params;
  const supabase = createAdminClient();

  const { data: review } = await supabase
    .from("reviews")
    .select(
      "id, reviewer_name, reviewer_photo_url, star_rating, comment, sentiment, sentiment_themes, ai_analysis, requires_urgent_response, is_spam, review_created_at, created_at, organization_id, location_id, locations(name)"
    )
    .eq("id", reviewId)
    .single();

  if (!review) {
    return NextResponse.json({ error: "Review not found" }, { status: 404 });
  }

  const memberCheck = await requireMobileOrgMember(
    session.userId,
    review.organization_id
  );
  if (memberCheck instanceof NextResponse) return memberCheck;

  // Get all responses for this review
  const { data: responses } = await supabase
    .from("responses")
    .select(
      "id, content, status, is_ai_generated, ai_tokens_used, created_by, approved_by, approved_at, created_at, updated_at"
    )
    .eq("review_id", reviewId)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    review,
    responses: responses ?? [],
  });
}
