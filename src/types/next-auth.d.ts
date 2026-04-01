import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    };
    supabaseAccessToken?: string;
    orgId?: string;
  }

  interface User {
    id: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    role?: string;
    orgId?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    supabaseAccessToken?: string;
  }
}
