"use server";

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

export type RegisterResult = {
  success: boolean;
  error?: string;
};

// Helper: get an untyped handle for the next_auth schema.
// The Supabase TS client doesn't support multi-schema typing,
// so we cast to `any` for next_auth operations.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nextAuthSchema(supabase: ReturnType<typeof createAdminClient>): any {
  return supabase.schema("next_auth");
}

export async function register(
  _prev: RegisterResult | null,
  formData: FormData
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;
  const supabase = createAdminClient();
  const naSchema = nextAuthSchema(supabase);

  // Check for existing user in next_auth.users
  const { data: existing } = await naSchema
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return { success: false, error: "An account with this email already exists" };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user in next_auth.users (trigger auto-syncs to public.users)
  const { data: newUser, error: createError } = await naSchema
    .from("users")
    .insert({ name, email })
    .select("id")
    .single();

  if (createError || !newUser) {
    console.error("Error creating user:", createError);
    return { success: false, error: "Failed to create account. Please try again." };
  }

  const userId = (newUser as { id: string }).id;

  // Store password hash in public.users
  const { error: hashError } = await supabase
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", userId);

  if (hashError) {
    console.error("Error storing password hash:", hashError);
    // Clean up the created user
    await naSchema.from("users").delete().eq("id", userId);
    return { success: false, error: "Failed to create account. Please try again." };
  }

  // Generate verification token (store hashed, send raw)
  const rawToken = crypto.randomUUID();
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const { error: tokenError } = await naSchema
    .from("verification_tokens")
    .insert({
      identifier: email,
      token: hashedToken,
      expires: expires.toISOString(),
    });

  if (tokenError) {
    console.error("Error creating verification token:", tokenError);
    return { success: false, error: "Failed to send verification email." };
  }

  // Send verification email via Resend
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
              This link expires in 24 hours. If you didn't create an account, you can ignore this email.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      // Don't fail registration if email fails — user can request a new one
    }
  }

  return { success: true };
}

// --- Password Reset ---

const resetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function requestPasswordReset(
  _prev: RegisterResult | null,
  formData: FormData
): Promise<RegisterResult> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;
  const supabase = createAdminClient();
  const naSchema = nextAuthSchema(supabase);

  const { data: user } = await naSchema
    .from("users")
    .select("id, name")
    .eq("email", email)
    .single();

  // Always return success to prevent email enumeration
  if (!user) return { success: true };

  const rawToken = crypto.randomUUID();
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await naSchema.from("verification_tokens").insert({
    identifier: "reset:" + email,
    token: hashedToken,
    expires: expires.toISOString(),
  });

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "ReviewAI <noreply@reviewai.app>",
        to: email,
        subject: "Reset your ReviewAI password",
        html:
          '<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">' +
          "<h2>Password Reset</h2>" +
          "<p>Hi " + (user.name ?? "there") + ", we received a request to reset your password.</p>" +
          '<a href="' + baseUrl + "/auth/reset-password?token=" + rawToken + '"' +
          ' style="display: inline-block; background: #1a73e8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">' +
          "Reset Password</a>" +
          '<p style="color: #666; font-size: 14px; margin-top: 16px;">' +
          "This link expires in 1 hour. If you didn't request this, you can ignore this email.</p></div>",
      });
    } catch (error) {
      console.error("Error sending reset email:", error);
    }
  }

  return { success: true };
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function resetPassword(
  _prev: RegisterResult | null,
  formData: FormData
): Promise<RegisterResult> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { token, password } = parsed.data;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const supabase = createAdminClient();
  const naSchema = nextAuthSchema(supabase);

  const { data: tokenRecord } = await naSchema
    .from("verification_tokens")
    .select("identifier, token, expires")
    .eq("token", hashedToken)
    .single();

  if (!tokenRecord || !String(tokenRecord.identifier).startsWith("reset:")) {
    return { success: false, error: "Invalid or expired reset link." };
  }

  if (new Date(tokenRecord.expires) < new Date()) {
    await naSchema.from("verification_tokens").delete().eq("token", hashedToken);
    return { success: false, error: "Reset link has expired. Please request a new one." };
  }

  const email = String(tokenRecord.identifier).replace("reset:", "");

  const { data: user } = await naSchema
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (!user) return { success: false, error: "User not found." };

  const passwordHash = await bcrypt.hash(password, 12);
  await supabase.from("users").update({ password_hash: passwordHash }).eq("id", user.id);

  await naSchema.from("verification_tokens").delete().eq("token", hashedToken);

  return { success: true };
}
