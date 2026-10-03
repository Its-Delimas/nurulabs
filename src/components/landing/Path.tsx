"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Hammer } from "lucide-react";
import { tracks } from "@/lib/curriculum/tracks";
import type { Track } from "@/lib/curriculum/types";
import { button } from "@/components/ui/button";
import SectionHeading from "@/components/ui/SectionHeading";

export interface TrackFacts {
  labs: number;
  projects: number;
  modules: number;
}

const ease = [0.16, 1, 0.3, 1] as const;

// Tools the tracks teach hands-on (see each track's labs).
const TOOLS = ["Python", "Jupyter & Colab", "pandas", "SQL", "Excel", "matplotlib", "Git & GitHub", "scikit-learn", "dbt", "Airflow-style DAGs", "PyTorch", "Hugging Face"];

function Facts({ facts }: { facts: TrackFacts }) {
  return (
    <p className="text-sm text-ink/60">
      <strong className="font-semibold text-ink">{facts.labs}</strong> labs ·{" "}
      <strong className="font-semibold text-ink">{facts.projects}</strong> {facts.projects === 1 ? "project" : "projects"} ·{" "}
      <strong className="font-semibold text-ink">{facts.modules}</strong> modules
    </p>
  );
}

/** Three bars, filled up to the path's difficulty. */
function Difficulty({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-2 text-xs text-ink/60">
      <span className="sr-only">Difficulty {level} of 3</span>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={`w-1.5 rounded-sm ${n <= level ? "bg-lime-deep" : "bg-ink/15"}`} style={{ height: 4 + n * 3 }} />
        ))}
      </span>
    </span>
  );
}

/**
 * The programme as a hierarchy: Python Essentials first, on its own, then the
 * paths it unlocks, easiest to hardest (the order of `tracks`).
 * Numbers come from the server (app/page.tsx).
 */
export default function Path({ facts }: { facts: Record<string, TrackFacts> }) {
  const live = tracks.filter((t) => t.status === "active");
  const soon = tracks.filter((t) => t.status !== "active");
  const [foundation, ...paths] = live;
  const factsFor = (t: Track) => facts[t.slug] ?? { labs: 0, projects: 0, modules: 0 };

  return (
    <section id="tracks" aria-labelledby="tracks-title" className="scroll-mt-20 border-t border-ink/10 bg-cream px-4 py-20 sm:px-6 md:px-10 md:py-28 xl:px-16">
      <SectionHeading
        id="tracks-title"
        size="lg"
        eyebrow="A programme, not a playlist"
        title="Enroll in one track. Finish it. Move up."
        lede="Everyone starts with Python Essentials. Then choose a path, from the most approachable to the most demanding. Already code in Python? Take the placement check and go straight to step two."
      />

      {/* Step 1: the foundation, on its own row */}
      {foundation && (
        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease }}
          className="mt-12 grid grid-cols-1 overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
        >
          {foundation.cover && (
            <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[360px]">
              <Image src={foundation.cover.src} alt={foundation.cover.alt} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover" />
              <span className="absolute top-4 left-4 rounded-md bg-lime px-2.5 py-1 font-mono text-[11px] font-semibold text-onlime">STEP 1 · START HERE</span>
            </div>
          )}
          <div className="flex flex-col justify-center p-6 md:p-10">
            <p className="text-sm text-ink/60">{foundation.level} · no experience needed</p>
            <h3 className="mt-1 font-display text-3xl font-semibold text-ink md:text-4xl">{foundation.name}</h3>
            <p className="mt-3 max-w-xl leading-relaxed text-ink/70">{foundation.description}</p>
            <div className="mt-5">
              <Facts facts={factsFor(foundation)} />
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link href={`/tracks/${foundation.slug}`} className={button({ size: "lg" })}>
                Start with {foundation.name} <ArrowRight size={17} />
              </Link>
              <Link href={`/placement/${foundation.slug}`} className="text-sm font-medium text-ink/70 underline underline-offset-4 hover:text-ink">
                Already code? Take the placement check
              </Link>
            </div>
          </div>
        </motion.article>
      )}

      {/* Step 2: the paths it unlocks */}
      {paths.length > 0 && (
        <>
          <div className="mt-14 flex items-center gap-4">
            <span className="h-px flex-1 bg-ink/10" aria-hidden="true" />
            <h3 className="rounded-md bg-paper px-3 py-1.5 font-mono text-[11px] font-semibold text-ink/70 ring-1 ring-ink/10">STEP 2 · CHOOSE A PATH</h3>
            <span className="h-px flex-1 bg-ink/10" aria-hidden="true" />
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {paths.map((track, i) => (
              <motion.article
                key={track.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, ease, delay: i * 0.06 }}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/10 transition-shadow hover:shadow-lg has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-lime-deep"
              >
                {track.cover && (
                  <div className="relative aspect-[16/9]">
                    <Image src={track.cover.src} alt={track.cover.alt} fill sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover" />
                    <span className="absolute top-3 left-3 rounded-md bg-paper px-2 py-1 font-mono text-[11px] font-semibold text-ink">PATH {i + 1}</span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-ink/60">{track.level}</p>
                    <Difficulty level={i + 1} />
                  </div>
                  <h4 className="mt-1 font-display text-2xl font-semibold text-ink">
                    <Link href={`/tracks/${track.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                      {track.name}
                    </Link>
                  </h4>
                  <p className="mt-1 font-medium text-ink/75">{track.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{track.description}</p>
                  <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                    <Facts facts={factsFor(track)} />
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-ink text-paper transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                      <ArrowRight size={17} />
                    </span>
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
            <Link key={t.slug} href={`/tracks/${t.slug}`} className="inline-flex items-center gap-2 rounded-md border border-dashed border-ink/20 px-4 py-2.5 text-sm text-ink/65 hover:border-ink/40 hover:text-ink">
              <Hammer size={14} />
              {t.name}: being built, see the plan
            </Link>
          ))}
        </div>
      )}

      {/* The tools the tracks teach, by name */}
      <div className="mt-14 border-t border-ink/10 pt-8">
        <p className="text-sm font-semibold text-ink">The tools teams actually use, taught for real</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {TOOLS.map((tool) => (
            <li key={tool} className="rounded-md bg-paper px-3 py-1.5 text-sm text-ink/75 ring-1 ring-ink/10">
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
