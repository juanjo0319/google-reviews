import { createClient } from "@supabase/supabase-js";
import { auth } from "@/lib/auth";
import type { Database } from "./types";

/**
 * Creates a Supabase client authenticated with the current user's session.
 * The JWT (supabaseAccessToken) is signed with SUPABASE_JWT_SECRET by Auth.js
 * and passed in the Authorization header so RLS policies are enforced.
 *
 * Use this in Server Components, Server Actions, and Route Handlers.
 */
export async function createAuthenticatedClient() {
  const session = await auth();
  const token = session?.supabaseAccessToken;

  if (!token) {
    throw new Error(
      "No Supabase access token found in session. Is the user signed in?"
    );
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-key-for-build",
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}
