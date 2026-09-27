"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { labLabel, moduleLabs, tracks } from "@/lib/curriculum";
import { setPreview, useProgress } from "@/lib/progress";

/** Reviewer tool: open every lab without enrolling or finishing earlier labs. */
export default function PreviewPanel() {
  const progress = useProgress();
  const on = !!progress?.preview;
  const live = tracks.filter((t) => t.modules.some((m) => moduleLabs(m).length));

  return (
    <div>
      <section className="rounded-[28px] bg-paper p-7 ring-1 ring-ink/10 md:p-10">
        <p className="eyebrow text-lime-deep">Reviewer tool</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink">Preview mode</h1>
        <p className="mt-3 max-w-2xl leading-relaxed text-ink/60">
          Learners unlock labs one at a time. Preview mode opens every built lab — including tracks still being built — in this browser, so you
          can check any lesson directly. Your progress isn&apos;t changed, and turning it off restores the normal locks.
        </p>
        <button
          type="button"
          onClick={() => setPreview(!on)}
          className={`mt-6 inline-flex items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold ${on ? "bg-ink text-paper" : "bg-lime text-onlime"}`}
        >
          {on ? <EyeOff size={16} /> : <Eye size={16} />}
          {on ? "Turn preview mode off" : "Turn preview mode on"}
        </button>
        <p className="mt-3 text-sm text-ink/50">Preview mode is {on ? "on — every lab is open." : "off."}</p>
      </section>

      <section className="mt-10 space-y-8">
        {live.map((track) => (
          <div key={track.slug}>
            <h2 className="font-display text-xl font-semibold text-ink">
              {track.name}
              {track.status === "coming-soon" && <span className="ml-2 align-middle text-xs font-semibold text-ink/40">not yet open to learners</span>}
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {track.modules.map((mod, i) => {
                const labs = moduleLabs(mod);
                if (!labs.length) return null;
                return (
                  <div key={mod.slug} className="rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
                    <p className="eyebrow text-ink/40">Module {i + 1}</p>
                    <p className="mt-1 font-display font-semibold text-ink">{mod.title}</p>
                    <ul className="mt-3 space-y-1.5">
                      {labs.map((lab) => (
                        <li key={lab.slug}>
                          <Link href={`/labs/${lab.slug}`} className={`text-sm hover:underline ${on ? "text-ink/80" : "pointer-events-none text-ink/35"}`}>
                            {labLabel(lab, track)} · {lab.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
