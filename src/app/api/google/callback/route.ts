import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { getCurrentOrg } from "@/lib/auth/permissions";

export const dynamic = "force-dynamic";

/**
 * Handles the Google OAuth callback after the user grants GBP access.
 * Exchanges the auth code for tokens and stores them in google_oauth_tokens.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL(
        "/dashboard/settings?error=google_oauth_denied",
        request.url
      )
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=invalid_callback", request.url)
    );
  }

  // Verify CSRF state
  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (state !== savedState) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=invalid_state", request.url)
    );
  }

  // Exchange code for tokens
  const baseUrl =
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${baseUrl}/api/google/callback`,
    }),
  });

  const tokens = await tokenResponse.json();
  if (!tokenResponse.ok) {
    console.error("Token exchange failed:", tokens);
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=token_exchange_failed", request.url)
    );
  }

  // Get current organization
  const orgData = await getCurrentOrg();
  if (!orgData) {
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=no_organization", request.url)
    );
  }

  // Store tokens
  const supabase = createAdminClient();
  const { error: upsertError } = await supabase
    .from("google_oauth_tokens")
    .upsert(
      {
        organization_id: orgData.orgId,
        user_id: session.user.id,
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
    console.error("Error storing tokens:", upsertError);
    return NextResponse.redirect(
      new URL("/dashboard/settings?error=token_storage_failed", request.url)
    );
  }

  // Redirect to location selection
  return NextResponse.redirect(
    new URL("/dashboard/settings/locations", request.url)
  );
}
