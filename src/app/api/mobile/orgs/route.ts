import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET  /api/mobile/orgs — list user's organizations
 * POST /api/mobile/orgs — create a new organization
 */
export async function GET(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const supabase = createAdminClient();

  const { data: memberships } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, slug, plan_tier)")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: true });

  const organizations = (memberships ?? []).map((m) => {
    const org = m.organizations as unknown as {
      id: string;
      name: string;
      slug: string;
      plan_tier: string;
    };
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      planTier: org.plan_tier,
      role: m.role,
    };
  });

  return NextResponse.json({ organizations });
}

export async function POST(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const name: string | undefined = body.name;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Organization name is required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const slug =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36);

  const { data: org, error } = await supabase
    .from("organizations")
    .insert({ name: name.trim(), slug })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }

  // Add creator as owner
  await supabase.from("organization_members").insert({
    organization_id: org.id,
    user_id: session.userId,
    role: "owner",
  });

  // Create default notification preferences
  await supabase.from("notification_preferences").insert({
    user_id: session.userId,
    organization_id: org.id,
  });

  return NextResponse.json(
    { id: org.id, slug: org.slug, name: name.trim() },
    { status: 201 }
  );
}
