import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createAdminClient } from "@/lib/supabase/admin";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/business.manage",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const supabase = createAdminClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const naSchema = supabase.schema("next_auth") as any;

        // Check next_auth.users for emailVerified
        const { data: authUser } = await naSchema
          .from("users")
          .select("id, email, name, image, emailVerified")
          .eq("email", email)
          .single();

        if (!authUser) return null;

        // Reject unverified emails
        if (!authUser.emailVerified) return null;

        // Check password from public.users
        const { data: publicUser } = await supabase
          .from("users")
          .select("password_hash")
          .eq("id", authUser.id)
          .single();

        if (!publicUser?.password_hash) return null;

        const isValid = await bcrypt.compare(password, publicUser.password_hash);
        if (!isValid) return null;

        return {
          id: authUser.id,
          email: authUser.email,
          name: authUser.name,
          image: authUser.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const publicPaths = [
        "/",
        "/login",
        "/signup",
        "/pricing",
        "/about",
      ];
      const isPublicPath =
        publicPaths.includes(pathname) ||
        pathname.startsWith("/auth/") ||
        pathname.startsWith("/api/auth/") ||
        pathname.startsWith("/api/webhooks/");

      if (isPublicPath) return true;

      if (!isLoggedIn) return false;

      // Redirect logged-in users away from login/signup
      if (pathname === "/login" || pathname === "/signup") {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
