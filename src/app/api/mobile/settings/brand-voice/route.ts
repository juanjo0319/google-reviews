import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * GET /api/mobile/settings/brand-voice?orgId=... — get brand voice config
 * PUT /api/mobile/settings/brand-voice        — save brand voice config
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

  const { data: config } = await supabase
    .from("brand_voice_configs")
    .select("*")
    .eq("organization_id", orgId)
    .is("location_id", null)
    .single();

  return NextResponse.json({ config: config ?? null });
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

  const configData = {
    tone: body.tone ?? "professional",
    formality: body.formality ?? 5,
    humor_level: body.humor_level ?? 3,
    use_emoji: body.use_emoji ?? false,
    signature_name: body.signature_name ?? null,
    preferred_phrases: body.preferred_phrases ?? [],
    avoid_phrases: body.avoid_phrases ?? [],
    response_length: body.response_length ?? "medium",
    custom_examples: body.custom_examples ?? null,
    values: body.values ?? [],
    updated_at: new Date().toISOString(),
  };

  // Check if config already exists
  const { data: existing } = await supabase
    .from("brand_voice_configs")
    .select("id")
    .eq("organization_id", orgId)
    .is("location_id", null)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("brand_voice_configs")
      .update(configData)
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update brand voice" },
        { status: 500 }
      );
    }
  } else {
    const { error } = await supabase.from("brand_voice_configs").insert({
      organization_id: orgId,
      ...configData,
    });

    if (error) {
      return NextResponse.json(
        { error: "Failed to save brand voice" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
