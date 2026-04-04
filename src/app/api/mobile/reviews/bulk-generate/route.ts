import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateReviewResponse } from "@/lib/ai/generate-response";

/**
 * POST /api/mobile/reviews/bulk-generate — generate AI responses for multiple reviews
 */
export async function POST(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const reviewIds: string[] = body.reviewIds;
  const orgId: string | undefined = body.orgId;

  if (!reviewIds?.length) {
    return NextResponse.json({ error: "reviewIds is required" }, { status: 400 });
  }
  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const userId = session.userId;

  // Verify reviews belong to this org
  const supabase = createAdminClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id")
    .eq("organization_id", orgId)
    .in("id", reviewIds);

  const validIds = (reviews ?? []).map((r) => r.id);

  let generated = 0;
  let failed = 0;
  const CONCURRENCY = 5;
  const queue = [...validIds];

  async function worker() {
    while (queue.length > 0) {
      const reviewId = queue.shift();
      if (!reviewId) break;
      try {
        await generateReviewResponse(reviewId, {
          createdByUserId: userId,
        });
        generated++;
      } catch (err) {
        console.error("Bulk generation failed for " + reviewId + ":", err);
        failed++;
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, validIds.length) },
    () => worker()
  );
  await Promise.all(workers);

  return NextResponse.json({ generated, failed, total: validIds.length });
}
