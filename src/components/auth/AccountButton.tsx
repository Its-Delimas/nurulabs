"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { authEnabled } from "@/lib/supabase/config";
import { displayName, signOut, useAuth } from "@/lib/auth";

/**
 * "Sign in" when signed out; the learner's initial with a small menu when
 * signed in. Renders nothing when accounts aren't configured.
 */
export default function AccountButton({ compact = false }: { compact?: boolean }) {
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!authEnabled || !ready) return null;

  if (!user) {
    return (
      <Link href="/login" className={`inline-flex items-center gap-2 text-sm font-medium text-ink/65 hover:text-ink ${compact ? "" : "px-2"}`}>
        <UserRound size={16} />
        Sign in
      </Link>
    );
  }

  const name = displayName(user);
  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account: ${name}`}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-lime font-display text-sm font-semibold text-onlime ring-2 ring-paper"
      >
        {name.charAt(0).toUpperCase()}
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl bg-paper shadow-lg ring-1 ring-ink/10">
          <div className="border-b border-ink/10 px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            {user.email && <p className="truncate text-xs text-ink/50">{user.email}</p>}
          </div>
          <Link role="menuitem" href="/dashboard" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-ink/75 hover:bg-cream">
            My learning
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => { setOpen(false); signOut(); }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink/75 hover:bg-cream"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
