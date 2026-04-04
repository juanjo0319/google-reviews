import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/mobile/notifications?orgId=...&limit=50&offset=0&unreadOnly=false
 */
export async function GET(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { searchParams } = request.nextUrl;
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(searchParams.get("offset") ?? "0");
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const supabase = createAdminClient();

  let query = supabase
    .from("notifications")
    .select("id, type, title, message, data, read, created_at", { count: "exact" })
    .eq("user_id", session.userId)
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    query = query.eq("read", false);
  }

  const { data: notifications, count } = await query;

  // Get unread count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.userId)
    .eq("organization_id", orgId)
    .eq("read", false);

  return NextResponse.json({
    notifications: notifications ?? [],
    total: count ?? 0,
    unreadCount: unreadCount ?? 0,
    limit,
    offset,
  });
}
