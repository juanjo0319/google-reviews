import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, issueMobileTokens } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const refreshToken: string | undefined = body.refreshToken;

  if (!refreshToken) {
    return NextResponse.json(
      { error: "refreshToken is required" },
      { status: 400 }
    );
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }

  // Verify user still exists
  const supabase = createAdminClient();
  const { data: user } = await supabase
    .from("users")
    .select("id, email")
    .eq("id", payload.sub)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  const tokens = issueMobileTokens(user.id, user.email ?? payload.email);
  return NextResponse.json(tokens);
}
