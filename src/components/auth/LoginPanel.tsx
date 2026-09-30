"use client";

import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Loader2, Mail } from "lucide-react";
import { authEnabled, safeNext } from "@/lib/supabase/config";
import { displayName, sendSignInLink, signInWithGoogle, signOut, useAuth } from "@/lib/auth";

const BENEFITS = [
  "Pick up where you left off on any phone or computer",
  "Keep your labs, milestones and streak if you clear your browser",
  "Still free, with no card and no fees",
];

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** Sign in with Google or an emailed link. Accounts are optional. */
export default function LoginPanel() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, ready } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState<"google" | "email" | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(params.get("error"));

  async function google() {
    setBusy("google");
    setError(null);
    const { error } = await signInWithGoogle(next);
    if (error) {
      setError(error);
      setBusy(null);
    }
  }

  async function emailLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy("email");
    setError(null);
    const { error } = await sendSignInLink(email.trim(), next);
    setBusy(null);
    if (error) setError(error);
    else setSentTo(email.trim());
  }

  return (
    <section className="grid overflow-hidden rounded-[28px] bg-paper ring-1 ring-ink/10 lg:grid-cols-2">
      <div className="bg-cream/60 p-7 md:p-10">
        <p className="eyebrow text-lime-deep">Your account</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">Save your progress</h1>
        <p className="mt-3 max-w-md leading-relaxed text-ink/60">
          You can learn without an account: progress is kept in this browser. Sign in to keep it safe and take it with you.
        </p>
        <ul className="mt-7 space-y-3">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-ink/75">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-onlime">
                <Check size={12} strokeWidth={3} />
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="p-7 md:p-10">
        {!authEnabled ? (
          <div className="max-w-sm">
            <h2 className="font-display text-xl font-semibold text-ink">Accounts are coming soon</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">For now, your progress is saved in this browser. Keep learning: nothing will be lost when accounts arrive.</p>
            <Link href="/dashboard" className="mt-6 inline-flex rounded-md bg-ink px-5 py-3 text-sm font-semibold text-paper">Go to my learning</Link>
          </div>
        ) : !ready ? (
          <p className="flex items-center gap-2 text-sm text-ink/55"><Loader2 size={16} className="animate-spin" /> Checking your session…</p>
        ) : user ? (
          <div className="max-w-sm">
            <h2 className="font-display text-xl font-semibold text-ink">You&apos;re signed in</h2>
            <p className="mt-2 text-sm text-ink/60">
              as <strong className="text-ink">{displayName(user)}</strong>{user.email ? ` (${user.email})` : ""}.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={next} className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-paper">Continue learning</Link>
              <button type="button" onClick={() => signOut()} className="rounded-md px-5 py-3 text-sm font-semibold text-ink ring-1 ring-ink/15 hover:bg-cream">Sign out</button>
            </div>
          </div>
        ) : sentTo ? (
          <div className="max-w-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-soft text-lime-deep"><Mail size={20} /></span>
            <h2 className="mt-4 font-display text-xl font-semibold text-ink">Check your email</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">
              We sent a sign-in link to <strong className="text-ink">{sentTo}</strong>. Open it on this device to finish signing in. It can take a minute; check spam too.
            </p>
            <button type="button" onClick={() => setSentTo(null)} className="mt-5 text-sm font-semibold text-ink underline-offset-4 hover:underline">Use a different email</button>
          </div>
        ) : (
          <div className="max-w-sm">
            <h2 className="font-display text-xl font-semibold text-ink">Sign in or create an account</h2>
            <p className="mt-1 text-sm text-ink/55">One step. No password to remember.</p>

            <button
              type="button"
              onClick={google}
              disabled={busy !== null}
              className="mt-6 flex w-full items-center justify-center gap-3 rounded-md bg-paper px-5 py-3 text-sm font-semibold text-ink ring-1 ring-ink/20 transition-colors hover:bg-cream disabled:opacity-60"
            >
              {busy === "google" ? <Loader2 size={18} className="animate-spin" /> : <GoogleMark />}
              Continue with Google
            </button>

            <div className="my-6 flex items-center gap-3 text-xs text-ink/40">
              <span className="h-px flex-1 bg-ink/10" /> or use your email <span className="h-px flex-1 bg-ink/10" />
            </div>

            <form onSubmit={emailLink} className="space-y-3">
              <label htmlFor="email" className="block text-sm font-medium text-ink/75">Email address</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md bg-paper px-4 py-3 text-sm text-ink ring-1 ring-ink/20 outline-none placeholder:text-ink/35 focus:ring-2 focus:ring-lime-deep"
              />
              <button type="submit" disabled={busy !== null || !email.trim()} className="flex w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-paper disabled:opacity-60">
                {busy === "email" && <Loader2 size={16} className="animate-spin" />}
                Email me a sign-in link
              </button>
            </form>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-5 max-w-sm rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>
        )}
      </div>
    </section>
  );
}
