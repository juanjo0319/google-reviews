import { NextRequest, NextResponse } from "next/server";
import {
  authenticateMobile,
  requireMobileOrgMember,
  requireMobileOrgAdmin,
} from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ orgId: string }> };

/**
 * GET  /api/mobile/orgs/[orgId] — get org details
 * PUT  /api/mobile/orgs/[orgId] — update org name/slug
 */
export async function GET(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { orgId } = await params;
  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = createAdminClient();

  const { data: org } = await supabase
    .from("organizations")
    .select("id, name, slug, plan_tier, stripe_customer_id, created_at, updated_at")
    .eq("id", orgId)
    .single();

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...org,
    role: memberCheck.role,
    hasStripe: !!org.stripe_customer_id,
  });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { orgId } = await params;
  const adminCheck = await requireMobileOrgAdmin(session.userId, orgId);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const body = await request.json();
  const name: string | undefined = body.name;
  const slug: string | undefined = body.slug;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Check slug uniqueness if provided
  if (slug?.trim()) {
    const { data: existingSlug } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", slug.trim())
      .neq("id", orgId)
      .single();

    if (existingSlug) {
      return NextResponse.json(
        { error: "This slug is already taken" },
        { status: 409 }
      );
    }
  }

  const updateData: Record<string, unknown> = {
    name: name.trim(),
    updated_at: new Date().toISOString(),
  };
  if (slug?.trim()) updateData.slug = slug.trim();

  const { error } = await supabase
    .from("organizations")
    .update(updateData)
    .eq("id", orgId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to update organization" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
