import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

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

export const proxy = auth;

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
