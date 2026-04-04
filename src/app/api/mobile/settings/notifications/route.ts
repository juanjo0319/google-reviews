import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/mobile/settings/notifications?orgId=... — get notification preferences
 * PUT /api/mobile/settings/notifications          — save notification preferences
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

  const supabase = createAdminClient();

  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("organization_id", orgId)
    .eq("user_id", session.userId)
    .single();

  return NextResponse.json({
    preferences: prefs ?? {
      new_review_email: true,
      new_review_in_app: true,
      weekly_digest: true,
      negative_review_alert: true,
    },
  });
}

export async function PUT(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const orgId: string | undefined = body.orgId;

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = createAdminClient();

  const prefsData = {
    new_review_email: body.new_review_email ?? true,
    new_review_in_app: body.new_review_in_app ?? true,
    weekly_digest: body.weekly_digest ?? true,
    negative_review_alert: body.negative_review_alert ?? true,
  };

  const { data: existing } = await supabase
    .from("notification_preferences")
    .select("id")
    .eq("organization_id", orgId)
    .eq("user_id", session.userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("notification_preferences")
      .update(prefsData)
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }
  } else {
    const { error } = await supabase.from("notification_preferences").insert({
      user_id: session.userId,
      organization_id: orgId,
      ...prefsData,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save preferences" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
