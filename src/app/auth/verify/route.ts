import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Helper: untyped handle for the next_auth schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nextAuthSchema(supabase: ReturnType<typeof createAdminClient>): any {
  return supabase.schema("next_auth");
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/auth/error?error=Verification", request.url)
    );
  }

  const supabase = createAdminClient();
  const naSchema = nextAuthSchema(supabase);

  // Look up the verification token
  const { data: verificationToken } = await naSchema
    .from("verification_tokens")
    .select("identifier, token, expires")
    .eq("token", token)
    .single();

  if (!verificationToken) {
    return NextResponse.redirect(
      new URL("/auth/error?error=Verification", request.url)
    );
  }

  // Check expiry
  if (new Date(verificationToken.expires) < new Date()) {
    // Clean up expired token
    await naSchema
      .from("verification_tokens")
      .delete()
      .eq("token", token);

    return NextResponse.redirect(
      new URL("/auth/error?error=Verification", request.url)
    );
  }

  // Mark user as verified
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

  // Delete the used token
  await naSchema
    .from("verification_tokens")
    .delete()
    .eq("token", token);

  return NextResponse.redirect(
    new URL("/login?verified=true", request.url)
  );
}
