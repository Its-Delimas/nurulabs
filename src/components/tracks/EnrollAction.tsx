"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Hammer, Lock } from "lucide-react";
import type { Track } from "@/lib/curriculum/types";
import { enrollment, trackStats } from "@/lib/curriculum";
import { enroll, type Progress } from "@/lib/progress";
import { button } from "@/components/ui/button";

/**
 * The single place that decides what a learner can do with a track:
 * enroll, continue, wait for their current track, or test out of a
 * prerequisite.
 */
export default function EnrollAction({
  track,
  progress,
}: {
  track: Track;
  progress: Progress | null;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  if (!progress) return <div className="h-10" />;

  const state = enrollment(track, progress);
  const primary = button();
  const muted = "text-sm text-ink/65";

  if (state.can) {
    if (!confirming) {
      return (
        <button type="button" onClick={() => setConfirming(true)} className={primary}>
          Enroll in {track.name}
          <ArrowRight size={15} />
        </button>
      );
    }
    return (
      <div role="group" aria-label={`Enroll in ${track.name}`} className="max-w-md rounded-xl bg-cream p-4">
        <p className="text-sm leading-relaxed text-ink/75">
          You&apos;ll focus on <span className="font-semibold">{track.name}</span> until you finish it: one track at a time, so
          every lab builds on the last.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              enroll(track.slug);
              router.push("/dashboard");
            }}
            className={primary}
          >
            Confirm and start
          </button>
          <button type="button" onClick={() => setConfirming(false)} className={button({ variant: "ghost" })}>
            Not yet
          </button>
        </div>
      </div>
    );
  }

  switch (state.reason) {
    case "enrolled": {
      const stats = trackStats(track, progress);
      return stats.complete ? (
        <p className="inline-flex items-center gap-2 font-semibold text-lime-deep">
          <Check size={16} /> Completed
        </p>
      ) : (
        <Link href="/dashboard" className={primary}>
          Continue learning
          <ArrowRight size={15} />
        </Link>
      );
    }
    case "coming-soon":
      return (
        <p className={`inline-flex items-center gap-2 ${muted}`}>
          <Hammer size={15} /> Being built, not open for enrollment yet
        </p>
      );
    case "busy":
      return (
        <p className={`inline-flex items-center gap-2 ${muted}`}>
          <Lock size={15} /> Finish {state.current.name} to enroll
        </p>
      );
    case "prerequisite": {
      const req = state.missing[0];
      return (
        <div className="space-y-2">
          <p className={`inline-flex items-center gap-2 ${muted}`}>
            <Lock size={15} /> Requires {req.name}
          </p>
          {req.placement && (
            <p>
              <Link
                href={`/placement/${req.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink underline underline-offset-4"
              >
                Already know {req.shortName}? Take the placement check
                <ArrowRight size={14} />
              </Link>
            </p>
          )}
        </div>
      );
    }
  }
}
