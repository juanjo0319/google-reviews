import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, getMobileOrg } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const supabase = createAdminClient();

  const { data: user } = await supabase
    .from("users")
    .select("id, name, email, image, onboarding_completed, created_at")
    .eq("id", session.userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get user's organizations
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

  // Get active org (first by default)
  const orgId = request.nextUrl.searchParams.get("orgId") ?? undefined;
  const activeOrg = await getMobileOrg(session.userId, orgId);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      onboardingCompleted: user.onboarding_completed,
      createdAt: user.created_at,
    },
    organizations,
    activeOrganization: activeOrg
      ? {
          id: activeOrg.orgId,
          role: activeOrg.role,
          name: activeOrg.organization.name,
          slug: activeOrg.organization.slug,
          planTier: activeOrg.organization.plan_tier,
        }
      : null,
  });
}
