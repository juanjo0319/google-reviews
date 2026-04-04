import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PUT /api/mobile/onboarding/org-name — update org name (onboarding step 1)
 */
export async function PUT(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const orgId: string | undefined = body.orgId;
  const name: string | undefined = body.name;

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }
  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Organization name is required" },
      { status: 400 }
    );
  }

  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("organizations")
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", orgId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update organization name" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
