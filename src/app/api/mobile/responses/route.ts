import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/mobile/responses?orgId=...&status=... — list responses grouped by status
 */
export async function GET(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const orgId = request.nextUrl.searchParams.get("orgId");
  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const statusFilter = request.nextUrl.searchParams.get("status");
  const supabase = createAdminClient();

  let query = supabase
    .from("responses")
    .select("id, review_id, content, status, is_ai_generated, created_at, updated_at")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: responses } = await query;
  const resps = responses ?? [];

  // Fetch associated review data
  const reviewIds = [...new Set(resps.map((r) => r.review_id))];
  const { data: reviews } = reviewIds.length > 0
    ? await supabase
        .from("reviews")
        .select("id, reviewer_name, star_rating, comment")
        .in("id", reviewIds)
    : { data: [] };

  const reviewMap = new Map((reviews ?? []).map((r) => [r.id, r]));

  const enriched = resps.map((resp) => {
    const review = reviewMap.get(resp.review_id);
    return {
      ...resp,
      review: review
        ? {
            reviewer_name: review.reviewer_name,
            star_rating: review.star_rating,
            comment: review.comment,
          }
        : null,
    };
  });

  // Group counts by status
  const counts = {
    draft: resps.filter((r) => r.status === "draft").length,
    pending_approval: resps.filter((r) => r.status === "pending_approval").length,
    approved: resps.filter((r) => r.status === "approved").length,
    published: resps.filter((r) => r.status === "published").length,
    rejected: resps.filter((r) => r.status === "rejected").length,
  };

  return NextResponse.json({ responses: enriched, counts });
}
