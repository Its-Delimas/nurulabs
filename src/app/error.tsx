"use client";

import Link from "next/link";
import { useEffect } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import Logo from "@/components/landing/Logo";

/** Shown when a page crashes. Progress lives in the browser, so it's never lost here. */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col bg-cream px-6 py-6 text-ink md:px-10 xl:px-16">
      <Logo />
      <main className="flex flex-1 items-center py-16">
        <div className="max-w-xl">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
            <TriangleAlert size={24} />
          </span>
          <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight md:text-5xl">Something went wrong on this page.</h1>
          <p className="mt-4 text-lg leading-relaxed text-ink/60">
            It&apos;s our fault, not yours, and your progress is safe. Try again, and if it keeps happening, go back to your learning and carry on from there.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" onClick={() => retry()} className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper">
              <RotateCcw size={16} /> Try again
            </button>
            <Link href="/dashboard" className="inline-flex items-center rounded-md px-6 py-3 text-sm font-semibold text-ink ring-1 ring-ink/15 hover:bg-paper">
              Go to my learning
            </Link>
          </div>
          {error.digest && <p className="mt-6 font-mono text-xs text-ink/35">Reference: {error.digest}</p>}
        </div>
      </main>
    </div>
  );
}
