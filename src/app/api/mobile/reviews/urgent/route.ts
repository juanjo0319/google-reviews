import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { getUrgentReviews } from "@/lib/services/reviews";

/**
 * GET /api/mobile/reviews/urgent?orgId=... — urgent reviews needing response
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

  const urgentReviews = await getUrgentReviews(orgId);
  return NextResponse.json({ reviews: urgentReviews });
}
