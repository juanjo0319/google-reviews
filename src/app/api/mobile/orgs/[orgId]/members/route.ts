import { NextRequest, NextResponse } from "next/server";
import {
  authenticateMobile,
  requireMobileOrgMember,
  requireMobileOrgAdmin,
} from "@/lib/mobile/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

type Params = { params: Promise<{ orgId: string }> };

/**
 * GET  /api/mobile/orgs/[orgId]/members — list org members
 * POST /api/mobile/orgs/[orgId]/members — invite a member
 */
export async function GET(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { orgId } = await params;
  const memberCheck = await requireMobileOrgMember(session.userId, orgId);
  if (memberCheck instanceof NextResponse) return memberCheck;

  const supabase = createAdminClient();

  const { data: members } = await supabase
    .from("organization_members")
    .select("user_id, role, created_at, users(id, name, email, image)")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });

  const result = (members ?? []).map((m) => ({
    userId: m.user_id,
    role: m.role,
    joinedAt: m.created_at,
    ...(m.users as unknown as {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    }),
  }));

  return NextResponse.json({ members: result });
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await authenticateMobile(request);
  if (session instanceof NextResponse) return session;

  const { orgId } = await params;
  const adminCheck = await requireMobileOrgAdmin(session.userId, orgId);
  if (adminCheck instanceof NextResponse) return adminCheck;

  const body = await request.json();
  const email: string | undefined = body.email;
  const role: "admin" | "member" = body.role ?? "member";

  if (!email?.trim()) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Look up invited user
  const { data: invitedUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (invitedUser) {
    const { error } = await supabase.from("organization_members").insert({
      organization_id: orgId,
      user_id: invitedUser.id,
      role,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "This user is already a member" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Failed to add member" },
        { status: 500 }
      );
    }
  }

  // Send invite email
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data: org } = await supabase
        .from("organizations")
        .select("name")
        .eq("id", orgId)
        .single();

      const { data: inviter } = await supabase
        .from("users")
        .select("name")
        .eq("id", session.userId)
        .single();

      const baseUrl =
        process.env.NEXTAUTH_URL ??
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000";

      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? "ReviewAI <noreply@reviewai.app>",
        to: email,
        subject: `You've been invited to ${org?.name ?? "an organization"} on ReviewAI`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>You've been invited!</h2>
            <p>${inviter?.name ?? "A team member"} invited you to join <strong>${org?.name}</strong> on ReviewAI.</p>
            <a href="${baseUrl}/signup"
               style="display: inline-block; background: #1a73e8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              ${invitedUser ? "Go to Dashboard" : "Create Account"}
            </a>
          </div>
        `,
      });
    } catch (error) {
      console.error("Error sending invite email:", error);
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
