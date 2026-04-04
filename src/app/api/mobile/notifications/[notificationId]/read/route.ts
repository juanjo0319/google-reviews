import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ notificationId: string }> };

/**
 * PUT /api/mobile/notifications/[notificationId]/read — mark as read/unread
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { notificationId } = await params;
  const body = await request.json();
  const read: boolean = body.read ?? true;

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("notifications")
    .update({ read })
    .eq("id", notificationId)
    .eq("user_id", session.userId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
