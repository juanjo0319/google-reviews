import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ reviewId: string }> };

/**
 * POST /api/mobile/reviews/[reviewId]/respond — save a manual draft response
 */
export async function POST(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { reviewId } = await params;
  const body = await request.json();
  const content: string | undefined = body.content;

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: review } = await supabase
    .from("reviews")
    .select("id, organization_id")
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

  const { data: response, error } = await supabase
    .from("responses")
    .insert({
      review_id: reviewId,
      organization_id: review.organization_id,
      content: content.trim(),
      status: "draft",
      is_ai_generated: false,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to save response" },
      { status: 500 }
    );
  }

  return NextResponse.json({ responseId: response.id }, { status: 201 });
}
