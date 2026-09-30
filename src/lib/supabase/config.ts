/**
 * Supabase settings, from environment variables (see .env.example).
 * Accounts are optional: without these, the site works as before and keeps
 * progress only in the learner's browser.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const authEnabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** Only follow redirects to paths on this site ("/dashboard", not "//evil.com" or "https://…"). */
export function safeNext(next: string | null | undefined, fallback = "/dashboard"): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
