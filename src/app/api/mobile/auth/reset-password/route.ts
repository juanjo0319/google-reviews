import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { token, password } = parsed.data;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const supabase = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const naSchema = supabase.schema("next_auth") as any;

  const { data: tokenRecord } = await naSchema
    .from("verification_tokens")
    .select("identifier, token, expires")
    .eq("token", hashedToken)
    .single();

  if (!tokenRecord || !String(tokenRecord.identifier).startsWith("reset:")) {
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 400 }
    );
  }

  if (new Date(tokenRecord.expires) < new Date()) {
    await naSchema.from("verification_tokens").delete().eq("token", hashedToken);
    return NextResponse.json(
      { error: "Reset link has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const email = String(tokenRecord.identifier).replace("reset:", "");

  const { data: user } = await naSchema
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await supabase.from("users").update({ password_hash: passwordHash }).eq("id", user.id);
  await naSchema.from("verification_tokens").delete().eq("token", hashedToken);

  return NextResponse.json({ success: true });
}
