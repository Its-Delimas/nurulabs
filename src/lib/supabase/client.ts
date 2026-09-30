import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, authEnabled } from "./config";

let client: SupabaseClient | null = null;

/** The browser's Supabase client, or null when accounts aren't configured. */
export function getSupabase(): SupabaseClient | null {
  if (!authEnabled || typeof window === "undefined") return null;
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return client;
}
