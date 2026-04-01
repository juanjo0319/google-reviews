"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

let _client: SupabaseClient<Database> | null = null;

/**
 * Client-side Supabase singleton using the anon key.
 * Use for Realtime subscriptions and other browser-side operations.
 * RLS policies are enforced via the JWT set by the server.
 */
export function getSupabaseClient() {
  if (!_client) {
    _client = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}
