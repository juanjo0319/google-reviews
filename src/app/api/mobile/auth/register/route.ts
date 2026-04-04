import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const naSchema = supabase.schema("next_auth") as any;

  // Check for existing user
  const { data: existing } = await naSchema
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  // Create user in next_auth.users
  const { data: newUser, error: createError } = await naSchema
    .from("users")
    .insert({ name, email })
    .select("id")
    .single();

  if (createError || !newUser) {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }

  const userId = (newUser as { id: string }).id;

  // Store password hash in public.users
  const { error: hashError } = await supabase
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", userId);

  if (hashError) {
    await naSchema.from("users").delete().eq("id", userId);
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }

  // Generate verification token
  const rawToken = crypto.randomUUID();
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await naSchema.from("verification_tokens").insert({
    identifier: email,
    token: hashedToken,
    expires: expires.toISOString(),
  });

  // Send verification email
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const baseUrl =
        process.env.NEXTAUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000";

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "ReviewAI <noreply@reviewai.app>",
        to: email,
        subject: "Verify your ReviewAI account",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Welcome to ReviewAI, ${name}!</h2>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${baseUrl}/auth/verify?token=${rawToken}"
               style="display: inline-block; background: #1a73e8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Verify Email
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 16px;">
              This link expires in 24 hours.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
