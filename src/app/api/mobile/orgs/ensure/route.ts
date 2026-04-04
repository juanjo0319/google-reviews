import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/mobile/orgs/ensure — ensure user has at least one org (called on first app launch)
 */
export async function POST(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const supabase = createAdminClient();

  // Check if user already has any org
  const { data: existing } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", session.userId)
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({ orgId: existing.organization_id, created: false });
  }

  // Get user name for org naming
  const { data: user } = await supabase
    .from("users")
    .select("name")
    .eq("id", session.userId)
    .single();

  const orgName = user?.name
    ? `${user.name}'s Organization`
    : "My Organization";

  const slug =
    orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36);

  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName, slug })
    .select("id")
    .single();

  if (orgError || !org) {
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }

  await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: session.userId,
    role: "owner",
  });

  await supabase.from("notification_preferences").insert({
    user_id: session.userId,
    organization_id: org.id,
  });

  return NextResponse.json({ orgId: org.id, created: true }, { status: 201 });
}
