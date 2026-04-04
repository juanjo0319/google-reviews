import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, requireMobileOrgMember } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * PUT /api/mobile/onboarding/brand-voice — quick brand voice setup (onboarding step 2)
 */
export async function PUT(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const orgId: string | undefined = body.orgId;
  const tone: string = body.tone ?? "professional";
  const formality: number = body.formality ?? 5;
  const useEmoji: boolean = body.useEmoji ?? false;
  const signatureName: string = body.signatureName ?? "";

  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = createAdminClient();

  const configData = {
    tone,
    formality,
    use_emoji: useEmoji,
    signature_name: signatureName || null,
    updated_at: new Date().toISOString(),
  };

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
