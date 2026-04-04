import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const JWT_SECRET = process.env.NEXTAUTH_SECRET ?? "dev-secret";
const ACCESS_TOKEN_TTL = "1h";
const REFRESH_TOKEN_TTL = "30d";

export interface MobileTokenPayload {
  sub: string; // user ID
  email: string;
  type: "access" | "refresh";
}

/**
 * Sign a mobile access or refresh token.
 */
export function signMobileToken(
  userId: string,
  email: string,
  type: "access" | "refresh"
): string {
  return jwt.sign(
    { sub: userId, email, type } satisfies MobileTokenPayload,
    JWT_SECRET,
    { expiresIn: type === "access" ? ACCESS_TOKEN_TTL : REFRESH_TOKEN_TTL }
  );
}

/**
 * Issue both access and refresh tokens for a user.
 */
export function issueMobileTokens(userId: string, email: string) {
  return {
    accessToken: signMobileToken(userId, email, "access"),
    refreshToken: signMobileToken(userId, email, "refresh"),
    expiresIn: 3600,
  };
}

/**
 * Verify a Bearer token from the Authorization header.
 * Returns the decoded payload or null.
 */
function verifyToken(token: string, expectedType: "access" | "refresh"): MobileTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MobileTokenPayload;
    if (decoded.type !== expectedType) return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract Bearer token from request Authorization header.
 */
function extractBearerToken(request: NextRequest): string | null {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export interface MobileSession {
  userId: string;
  email: string;
}

/**
 * Authenticate a mobile request via Bearer token.
 * Returns the session or a 401 response.
 */
export async function authenticateMobile(
  request: NextRequest
): Promise<MobileSession | NextResponse> {
  const token = extractBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing authorization header" }, { status: 401 });
  }

  const payload = verifyToken(token, "access");
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  return { userId: payload.sub, email: payload.email };
}

/**
 * Verify a refresh token. Returns the payload or null.
 */
export function verifyRefreshToken(token: string): MobileTokenPayload | null {
  return verifyToken(token, "refresh");
}

/**
 * Get the user's active organization (first org by default, or specified orgId).
 */
export async function getMobileOrg(userId: string, orgId?: string) {
  const supabase = createAdminClient();

  if (orgId) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("organization_id, role, organizations(id, name, slug, plan_tier)")
      .eq("organization_id", orgId)
      .eq("user_id", userId)
      .single();

    if (!membership) return null;

    return {
      orgId: membership.organization_id,
      role: membership.role,
      organization: membership.organizations as unknown as {
        id: string;
        name: string;
        slug: string;
        plan_tier: string;
      },
    };
  }

  // Fallback: first org
  const { data: firstMembership } = await supabase
    .from("organization_members")
    .select("organization_id, role, organizations(id, name, slug, plan_tier)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (!firstMembership) return null;

  return {
    orgId: firstMembership.organization_id,
    role: firstMembership.role,
    organization: firstMembership.organizations as unknown as {
      id: string;
      name: string;
      slug: string;
      plan_tier: string;
    },
  };
}

/**
 * Helper: require org membership for a mobile request.
 * Returns the membership or a 403 response.
 */
export async function requireMobileOrgMember(userId: string, orgId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organization_members")
    .select("role")
    .eq("organization_id", orgId)
    .eq("user_id", userId)
    .single();

  if (!data) {
    return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 });
  }

  return data;
}

/**
 * Helper: require org admin/owner for a mobile request.
 */
export async function requireMobileOrgAdmin(userId: string, orgId: string) {
  const result = await requireMobileOrgMember(userId, orgId);
  if (result instanceof NextResponse) return result;

  if (!["owner", "admin"].includes(result.role)) {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  return result;
}
