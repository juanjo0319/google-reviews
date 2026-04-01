import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nextAuthSchema(supabase: ReturnType<typeof createAdminClient>): any {
  return supabase.schema("next_auth");
}

export async function GET(request: NextRequest) {
  const rawToken = request.nextUrl.searchParams.get("token");

  if (!rawToken) {
    return NextResponse.redirect(
      new URL("/auth/error?error=Verification", request.url)
    );
  }

  // Hash the incoming token to match the stored hash
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const supabase = createAdminClient();
  const naSchema = nextAuthSchema(supabase);

  const { data: verificationToken } = await naSchema
    .from("verification_tokens")
    .select("identifier, token, expires")
    .eq("token", hashedToken)
    .single();

  if (!verificationToken) {
    return NextResponse.redirect(
      new URL("/auth/error?error=Verification", request.url)
    );
  }

  if (new Date(verificationToken.expires) < new Date()) {
    await naSchema
      .from("verification_tokens")
      .delete()
      .eq("token", hashedToken);

    return NextResponse.redirect(
      new URL("/auth/error?error=Verification", request.url)
    );
  }

  const { error: updateError } = await naSchema
    .from("users")
    .update({ emailVerified: new Date().toISOString() })
    .eq("email", verificationToken.identifier);

  if (updateError) {
    console.error("Error verifying user:", updateError);
    return NextResponse.redirect(
      new URL("/auth/error?error=Default", request.url)
    );
  }

  await naSchema
    .from("verification_tokens")
    .delete()
    .eq("token", hashedToken);

  return NextResponse.redirect(
    new URL("/login?verified=true", request.url)
  );
}
