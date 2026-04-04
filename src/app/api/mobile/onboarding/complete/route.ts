import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/mobile/onboarding/complete — mark onboarding as done
 */
export async function POST(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("users")
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.userId);

  if (error) {
    return NextResponse.json(
      { error: "Failed to complete onboarding" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
