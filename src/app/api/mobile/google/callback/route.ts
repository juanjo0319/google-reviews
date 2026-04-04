import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile, getMobileOrg } from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/mobile/google/callback — exchange Google auth code for tokens (mobile flow)
 *
 * The mobile app uses expo-auth-session to open Google OAuth in a browser,
 * gets the auth code via redirect, then sends it here to exchange + store tokens.
 */
export async function POST(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const code: string | undefined = body.code;
  const redirectUri: string | undefined = body.redirectUri;
  const orgId: string | undefined = body.orgId;

  if (!code) {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }
  if (!redirectUri) {
    return NextResponse.json(
      { error: "redirectUri is required" },
      { status: 400 }
    );
  }

  // Get org context
  const orgData = orgId
    ? await getMobileOrg(session.userId, orgId)
    : await getMobileOrg(session.userId);

  if (!orgData) {
    return NextResponse.json(
      { error: "No organization found" },
      { status: 404 }
    );
  }

  // Exchange code for tokens with Google
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  const tokens = await tokenResponse.json();
  if (!tokenResponse.ok) {
    console.error("Google token exchange failed:", tokens);
    return NextResponse.json(
      { error: "Failed to exchange authorization code" },
      { status: 400 }
    );
  }

  // Store tokens in google_oauth_tokens
  const supabase = createAdminClient();
  const { error: upsertError } = await supabase
    .from("google_oauth_tokens")
    .upsert(
      {
        organization_id: orgData.orgId,
        user_id: session.userId,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(
          Date.now() + tokens.expires_in * 1000
        ).toISOString(),
        scope: tokens.scope ?? null,
      },
      { onConflict: "id" }
    );

  if (upsertError) {
    console.error("Error storing Google tokens:", upsertError);
    return NextResponse.json(
      { error: "Failed to store tokens" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
