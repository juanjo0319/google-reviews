import { NextRequest, NextResponse } from "next/server";
import { authenticateMobile } from "@/lib/mobile/auth";
import { createClient } from "@supabase/supabase-js";

/**
 * POST /api/mobile/devices/register — register a push notification device token
 *
 * Note: This requires a `device_tokens` table in Supabase. Run the following migration:
 *
 * CREATE TABLE IF NOT EXISTS public.device_tokens (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
 *   token TEXT NOT NULL,
 *   platform TEXT NOT NULL DEFAULT 'ios',
 *   created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 *   updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 *   UNIQUE(user_id, token)
 * );
 *
 * CREATE INDEX idx_device_tokens_user_id ON public.device_tokens(user_id);
 */

// Untyped client for the device_tokens table (not yet in generated schema)
function getUntypedClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-key-for-build",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const token: string | undefined = body.token;
  const platform: string = body.platform ?? "ios";

  if (!token?.trim()) {
    return NextResponse.json(
      { error: "Device token is required" },
      { status: 400 }
    );
  }

  const supabase = getUntypedClient();

  const { error } = await supabase.from("device_tokens").upsert(
    {
      user_id: session.userId,
      token: token.trim(),
      platform,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,token" }
  );

  if (error) {
    console.error("Error registering device token:", error);
    return NextResponse.json(
      { error: "Failed to register device" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

/**
 * DELETE /api/mobile/devices/register — unregister a device token (on logout)
 */
export async function DELETE(request: NextRequest) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const token: string | undefined = body.token;

  if (!token) {
    return NextResponse.json(
      { error: "Device token is required" },
      { status: 400 }
    );
  }

  const supabase = getUntypedClient();

  await supabase
    .from("device_tokens")
    .delete()
    .eq("user_id", session.userId)
    .eq("token", token);

  return NextResponse.json({ success: true });
}
