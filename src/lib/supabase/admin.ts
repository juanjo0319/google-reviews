import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Creates a Supabase client using the service role key, which bypasses RLS.
 * Use ONLY for:
 *  - Server-side admin operations
 *  - Background jobs / cron tasks
 *  - Webhook handlers (Stripe, Google, etc.)
 *
 * Never expose this client or import this module in client components.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost:54321",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-key-for-build",
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
