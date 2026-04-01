import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import jwt from "jsonwebtoken";
import { authConfig } from "./auth.config";
import { createAdminClient } from "@/lib/supabase/admin";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321",
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-key-for-build",
  }),
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,

    async jwt({ token, user, account }) {
      // Initial sign-in: persist user id and OAuth tokens
      if (user) {
        token.sub = user.id;
        token.role = user.role ?? "member";
      }

      if (account) {
        token.accessToken = account.access_token ?? undefined;
        token.refreshToken = account.refresh_token ?? undefined;
        token.expiresAt = account.expires_at ?? undefined;
      }

      // Refresh Google token if expired
      if (
        token.expiresAt &&
        token.refreshToken &&
        Date.now() >= token.expiresAt * 1000
      ) {
        try {
          const response = await fetch(
            "https://oauth2.googleapis.com/token",
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
              }),
            }
          );

          const refreshed = await response.json();

          if (!response.ok) throw refreshed;

          token.accessToken = refreshed.access_token;
          token.expiresAt = Math.floor(
            Date.now() / 1000 + refreshed.expires_in
          );
          // Google may issue a new refresh token
          if (refreshed.refresh_token) {
            token.refreshToken = refreshed.refresh_token;
          }
        } catch (error) {
          console.error("Error refreshing Google token:", error);
          // Token refresh failed — mark it so the UI can prompt re-auth
          token.accessToken = undefined;
          token.expiresAt = undefined;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      session.user.role = token.role;
      session.orgId = token.orgId;

      // Sign a Supabase-compatible JWT for RLS
      session.supabaseAccessToken = jwt.sign(
        {
          aud: "authenticated",
          sub: token.sub,
          email: token.email,
          role: "authenticated",
        },
        process.env.SUPABASE_JWT_SECRET!,
        { expiresIn: "1h" }
      );

      return session;
    },

    async signIn({ user, account }) {
      // Store Google OAuth tokens for GBP API usage
      if (account?.provider === "google" && user.id) {
        try {
          const supabase = createAdminClient();

          await supabase.from("google_oauth_tokens").upsert(
            {
              user_id: user.id,
              // Organization will be set later when user links to an org
              organization_id: "00000000-0000-0000-0000-000000000000",
              access_token: account.access_token!,
              refresh_token: account.refresh_token!,
              expires_at: account.expires_at
                ? new Date(account.expires_at * 1000).toISOString()
                : null,
              scope: account.scope ?? null,
            },
            { onConflict: "id" }
          );
        } catch (error) {
          console.error("Error storing Google OAuth tokens:", error);
          // Don't block sign-in if token storage fails
        }
      }

      return true;
    },
  },
});
