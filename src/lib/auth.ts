"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@supabase/supabase-js";
import { authEnabled } from "./supabase/config";
import { getSupabase } from "./supabase/client";

export interface AuthState {
  /** The signed-in learner, or null. */
  user: User | null;
  /** False until Supabase has told us whether there's a session. */
  ready: boolean;
}

const SERVER_STATE: AuthState = { user: null, ready: false };
let state: AuthState = authEnabled ? SERVER_STATE : { user: null, ready: true };
const listeners = new Set<() => void>();
let started = false;

function start() {
  const supabase = getSupabase();
  if (started || !supabase) return;
  started = true;
  // Fires once straight away with the current session, then on every change.
  supabase.auth.onAuthStateChange((_event, session) => {
    state = { user: session?.user ?? null, ready: true };
    listeners.forEach((l) => l());
  });
}

function subscribe(listener: () => void) {
  start();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Who is signed in. Always `{ user: null, ready: true }` when accounts aren't configured. */
export function useAuth(): AuthState {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

/** A friendly name for the learner: their Google name, or the start of their email. */
export function displayName(user: User): string {
  const full = user.user_metadata?.full_name ?? user.user_metadata?.name;
  if (typeof full === "string" && full.trim()) return full.trim();
  return user.email?.split("@")[0] ?? "Learner";
}

/** Supabase's messages, in plain words where they aren't already. */
function friendly(message: string | undefined) {
  if (!message) return null;
  if (/fetch|network|timeout/i.test(message)) return "Couldn't reach the sign-in service. Check your connection and try again.";
  if (/rate limit|only request this after/i.test(message)) return "Too many sign-in emails in a short time. Please wait a minute and try again.";
  return message;
}

function callbackUrl(next: string) {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function signInWithGoogle(next: string) {
  const supabase = getSupabase();
  if (!supabase) return { error: "Accounts aren't available yet." };
  const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl(next) } });
  return { error: friendly(error?.message) };
}

export async function sendSignInLink(email: string, next: string) {
  const supabase = getSupabase();
  if (!supabase) return { error: "Accounts aren't available yet." };
  try {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: callbackUrl(next) } });
    return { error: friendly(error?.message) };
  } catch (e) {
    return { error: friendly(String(e)) };
  }
}

export async function signOut() {
  await getSupabase()?.auth.signOut();
}
