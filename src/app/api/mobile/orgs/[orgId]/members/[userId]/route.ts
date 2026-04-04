import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgAdmin } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ orgId: string; userId: string }> };

/**
 * PUT    /api/mobile/orgs/[orgId]/members/[userId] — update member role
 * DELETE /api/mobile/orgs/[orgId]/members/[userId] — remove member
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { orgId, userId: targetUserId } = await params;
  const adminCheck = await requireMobileOrgAdmin(session.userId, orgId);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const body = await request.json();
  const newRole: "admin" | "member" = body.role;

  if (!["admin", "member"].includes(newRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: targetMembership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", targetUserId)
    .single();

  if (!targetMembership) {
    return NextResponse.json(
      { error: "User is not a member of this organization" },
      { status: 404 }
    );
  }

  if (targetMembership.role === "owner") {
    return NextResponse.json(
      { error: "Cannot change the owner's role" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("organization_members")
    .update({ role: newRole })
    .eq("organization_id", orgId)
    .eq("user_id", targetUserId);

  if (error) {
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { orgId, userId: targetUserId } = await params;
  const adminCheck = await requireMobileOrgAdmin(session.userId, orgId);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const supabase = createAdminClient();

  const { data: targetMembership } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", targetUserId)
    .single();

  if (!targetMembership) {
    return NextResponse.json(
      { error: "User is not a member of this organization" },
      { status: 404 }
    );
  }

  if (targetMembership.role === "owner") {
    return NextResponse.json(
      { error: "Cannot remove the organization owner" },
      { status: 403 }
    );
  }

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("organization_id", orgId)
    .eq("user_id", targetUserId);

  if (error) {
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
