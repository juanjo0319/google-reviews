import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

const schema = z.object({
  email: z.string().email(),
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

  const { email } = parsed.data;
  const supabase = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const naSchema = supabase.schema("next_auth") as any;

  const { data: user } = await naSchema
    .from("users")
    .select("id, name")
    .eq("email", email)
    .single();

  // Always return success to prevent email enumeration
  if (!user) return NextResponse.json({ success: true });

  const rawToken = crypto.randomUUID();
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await naSchema.from("verification_tokens").insert({
    identifier: "reset:" + email,
    token: hashedToken,
    expires: expires.toISOString(),
  });

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
        subject: "Reset your ReviewAI password",
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Password Reset</h2>
            <p>Hi ${user.name ?? "there"}, we received a request to reset your password.</p>
            <a href="${baseUrl}/auth/reset-password?token=${rawToken}"
               style="display: inline-block; background: #1a73e8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Reset Password
            </a>
            <p style="color: #666; font-size: 14px; margin-top: 16px;">
              This link expires in 1 hour.
            </p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending reset email:", error);
    }
  }

  return NextResponse.json({ success: true });
}
