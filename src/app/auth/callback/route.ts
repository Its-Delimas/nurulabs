import { NextResponse, type NextRequest } from "next/server";
import { authEnabled, safeNext } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Where Google sign-in and emailed sign-in links return to. Swaps the one-time
 * code for a session (stored in cookies), then continues to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));
  if (!authEnabled) return NextResponse.redirect(`${origin}/`);

  const code = searchParams.get("code");
  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  const reason = searchParams.get("error_description") ?? "That sign-in link has expired or was already used.";
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(reason)}&next=${encodeURIComponent(next)}`);
}
