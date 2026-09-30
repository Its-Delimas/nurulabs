"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Hammer } from "lucide-react";
import { tracks } from "@/lib/curriculum/tracks";
import type { Track } from "@/lib/curriculum/types";

export interface TrackFacts {
  labs: number;
  projects: number;
}

const ease = [0.16, 1, 0.3, 1] as const;

function Stats({ track, facts, className = "" }: { track: Track; facts: TrackFacts; className?: string }) {
  const milestones = track.modules.filter((m) => m.milestone).length;
  return (
    <dl className={`grid grid-cols-3 divide-x divide-ink/10 rounded-2xl bg-paper py-3 text-center ring-1 ring-ink/10 ${className}`}>
      {[
        [String(facts.labs), "labs"],
        [String(facts.projects), facts.projects === 1 ? "project" : "projects"],
        [String(milestones), "milestones"],
      ].map(([v, l]) => (
        <div key={l} className="flex flex-col-reverse">
          <dt className="text-[11px] text-ink/50">{l}</dt>
          <dd className="font-display text-2xl font-semibold text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Three bars, filled up to the track's difficulty among the step-2 paths. */
function Difficulty({ level }: { level: number }) {
  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span key={n} className={`w-1.5 rounded-sm ${n <= level ? "bg-lime-deep" : "bg-ink/15"}`} style={{ height: 4 + n * 3 }} />
      ))}
    </span>
  );
}

/**
 * The programme as a hierarchy: Python Essentials first, on its own, then the
 * three paths it unlocks, easiest to hardest (the order of `tracks`).
 * Numbers come from the server (app/page.tsx).
 */
export default function Path({ facts }: { facts: Record<string, TrackFacts> }) {
  const live = tracks.filter((t) => t.status === "active");
  const soon = tracks.filter((t) => t.status !== "active");
  const [foundation, ...paths] = live;
  const factsFor = (t: Track) => facts[t.slug] ?? { labs: 0, projects: 0 };

  return (
    <section id="tracks" className="scroll-mt-20 bg-cream px-6 py-24 md:px-10 xl:px-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow text-lime-deep">A programme, not a playlist</p>
        <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">Enroll in one track. Finish it. Move up.</h2>
        <p className="mt-4 text-ink/60">
          Everyone starts with Python Essentials. Then choose a path: Data Science, Data Engineering, or AI &amp; Machine Learning, from the most
          approachable to the most demanding. Already code in Python? Take the placement check and go straight to step two.
        </p>
      </div>

      {/* Step 1: the foundation, on its own row */}
      {foundation && (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="group mt-14 grid overflow-hidden rounded-[28px] bg-paper shadow-[0_24px_50px_-32px_rgba(0,0,0,0.4)] ring-1 ring-ink/10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
        >
          {foundation.cover && (
            <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[380px]">
              <Image src={foundation.cover.src} alt={foundation.cover.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute top-5 left-5 rounded-full bg-lime px-3 py-1 font-mono text-[11px] font-semibold text-onlime">STEP 1 · START HERE</span>
            </div>
          )}
          <div className="flex flex-col justify-center p-7 md:p-10">
            <p className="text-xs font-semibold text-ink/45">{foundation.level} · no experience needed</p>
            <h3 className="mt-1 font-display text-3xl font-semibold text-ink md:text-4xl">{foundation.name}</h3>
            <p className="mt-3 max-w-xl leading-relaxed text-ink/65">{foundation.description}</p>
            <Stats track={foundation} facts={factsFor(foundation)} className="mt-7 max-w-md" />
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href="/tracks" className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5">
                Start here <ArrowRight size={16} />
              </Link>
              <Link href={`/tracks/${foundation.slug}`} className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-ink ring-1 ring-ink/20 transition-colors hover:ring-ink/50">
                Show syllabus
              </Link>
              <Link href={`/placement/${foundation.slug}`} className="text-sm text-ink/55 underline-offset-4 hover:text-ink hover:underline">
                Already code? Take the placement check
              </Link>
            </div>
          </div>
        </motion.article>
      )}

      {/* Step 2: the paths it unlocks */}
      {paths.length > 0 && (
        <>
          <div className="mt-14 flex items-center gap-4" aria-hidden="true">
            <span className="h-px flex-1 bg-ink/10" />
            <span className="rounded-full bg-paper px-4 py-1.5 font-mono text-[11px] font-semibold text-ink/60 ring-1 ring-ink/10">STEP 2 · CHOOSE A PATH</span>
            <span className="h-px flex-1 bg-ink/10" />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {paths.map((track, i) => (
              <motion.article
                key={track.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease, delay: i * 0.08 }}
                className="group relative flex flex-col overflow-hidden rounded-[28px] bg-paper shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)] ring-1 ring-ink/10 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_50px_-30px_rgba(0,0,0,0.45)]"
              >
                {track.cover && (
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image src={track.cover.src} alt={track.cover.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute top-4 left-4 rounded-full bg-paper/95 px-3 py-1 font-mono text-[11px] font-semibold text-ink">PATH {i + 1}</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-ink/45">{track.level}</p>
                    <span className="flex items-center gap-2 text-[11px] text-ink/45">
                      difficulty <Difficulty level={i + 1} />
                    </span>
                  </div>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-ink">{track.name}</h3>
                  <p className="mt-1 text-sm font-medium text-ink/70">{track.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">{track.description}</p>
                  <div className="mt-auto pt-6">
                    <Stats track={track} facts={factsFor(track)} />
                    <div className="flex items-center justify-between gap-4 pt-6">
                      <Link
                        href={`/tracks/${track.slug}`}
                        className="inline-flex w-full items-center justify-between gap-2 rounded-full bg-ink py-2 pl-5 pr-2 text-sm font-semibold text-paper"
                      >
                        Show syllabus
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lime text-onlime transition-transform group-hover:translate-x-0.5">
                          <ArrowRight size={16} />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </>
      )}

      {soon.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {soon.map((t) => (
            <Link key={t.slug} href={`/tracks/${t.slug}`} className="inline-flex items-center gap-2 rounded-full border border-dashed border-ink/20 px-4 py-2.5 text-sm text-ink/55 hover:border-ink/40 hover:text-ink/75">
              <Hammer size={14} />
              {t.name} — being built · see the plan
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
