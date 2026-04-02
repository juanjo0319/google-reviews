import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// IMPORTANT: Import from auth.config.ts only — not auth.ts.
// auth.ts imports the SupabaseAdapter which uses Node APIs.
// Although Next.js 16 proxy runs on Node by default, keeping
// this import-light prevents accidental heavy module loading
// on every proxied request.
//
// Security note: Never rely solely on proxy for auth.
// Always verify auth in Server Components and API routes
// (defense-in-depth against CVE-2025-29927).

const { auth } = NextAuth(authConfig);

const SUPPORTED_LOCALES = ["en", "es"];
const DEFAULT_LOCALE = "en";
const COOKIE_NAME = "NEXT_LOCALE";

function getLocaleFromRequest(request: NextRequest): string {
  // 1. Check cookie first
  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language") ?? "";
  const preferred = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().split("-")[0])
    .find((lang) => SUPPORTED_LOCALES.includes(lang));

  return preferred ?? DEFAULT_LOCALE;
}

// Wrap the auth middleware to add locale detection
const authMiddleware = auth;

export async function proxy(request: NextRequest) {
  // Run auth middleware first
  const authResponse = await (authMiddleware as unknown as (req: NextRequest) => Promise<NextResponse | Response | undefined>)(request);

  // Detect locale and set it in a response header for next-intl to read
  const locale = getLocaleFromRequest(request);

  // If auth returns a response (redirect, etc.), pass through but ensure cookie
  if (authResponse) {
    const response = authResponse instanceof NextResponse ? authResponse : NextResponse.next();
    // Pass pathname to server components so layouts can detect current route
    response.headers.set("x-pathname", request.nextUrl.pathname);
    // Set locale cookie if not already set
    if (!request.cookies.get(COOKIE_NAME)) {
      response.cookies.set(COOKIE_NAME, locale, {
        path: "/",
        maxAge: 365 * 24 * 60 * 60, // 1 year
        sameSite: "lax",
      });
    }
    return response;
  }

  // No auth redirect needed — just continue
  const response = NextResponse.next();
  // Pass pathname to server components so layouts can detect current route
  response.headers.set("x-pathname", request.nextUrl.pathname);
  // Set locale cookie if not already set
  if (!request.cookies.get(COOKIE_NAME)) {
    response.cookies.set(COOKIE_NAME, locale, {
      path: "/",
      maxAge: 365 * 24 * 60 * 60,
      sameSite: "lax",
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - _next/static (static files)
     *  - _next/image (image optimization)
     *  - favicon.ico, sitemap.xml, robots.txt
     *  - public folder assets (images, svgs, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
