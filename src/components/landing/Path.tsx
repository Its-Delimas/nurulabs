"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Hammer } from "lucide-react";
import { tracks } from "@/lib/curriculum/tracks";

export interface TrackFacts {
  labs: number;
  hours: number;
}

/** Track cards: photo, key numbers, and where each one leads. Numbers come from the server (app/page.tsx). */
export default function Path({ facts }: { facts: Record<string, TrackFacts> }) {
  const live = tracks.filter((t) => t.status === "active");
  const soon = tracks.filter((t) => t.status !== "active");

  return (
    <section id="tracks" className="scroll-mt-20 bg-cream px-6 py-24 md:px-10 xl:px-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow text-lime-deep">A programme, not a playlist</p>
        <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">Enroll in one track. Finish it. Move up.</h2>
        <p className="mt-4 text-ink/60">
          Start with Python for AI — everything builds on it — then choose AI &amp; Machine Learning or Data Science. Already
          code in Python? Take the placement check and go straight to step two.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {live.map((track, i) => {
          const f = facts[track.slug] ?? { labs: 0, hours: 0 };
          const milestones = track.modules.filter((m) => m.milestone).length;
          const first = i === 0;
          return (
            <motion.article
              key={track.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08 }}
              className="group relative flex flex-col overflow-hidden rounded-[28px] bg-paper shadow-[0_18px_40px_-28px_rgba(0,0,0,0.35)] ring-1 ring-ink/5"
            >
              {track.cover && (
                <div className="relative aspect-[16/10] overflow-hidden rounded-b-[28px]">
                  <Image src={track.cover.src} alt={track.cover.alt} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute top-4 left-4 rounded-full bg-lime px-3 py-1 font-mono text-[11px] font-semibold text-onlime">
                    {first ? "STEP 1" : "STEP 2 · CHOOSE ONE"}
                  </span>
                </div>
              )}
              <dl className="relative mx-6 -mt-7 grid grid-cols-3 divide-x divide-ink/10 rounded-2xl bg-paper py-3 text-center shadow-md ring-1 ring-ink/5">
                {[
                  [String(f.labs), "labs"],
                  [`~${f.hours}`, "hours"],
                  [String(milestones), "milestones"],
                ].map(([v, l]) => (
                  <div key={l} className="flex flex-col-reverse">
                    <dt className="text-[11px] text-ink/50">{l}</dt>
                    <dd className="font-display text-2xl font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-1 flex-col p-7">
                <p className="text-xs font-semibold text-ink/45">{track.level}</p>
                <h3 className="mt-1 font-display text-2xl font-semibold text-ink">{track.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">{track.description}</p>
                <div className="mt-auto flex items-center justify-between gap-4 pt-7">
                  <Link href={`/tracks/${track.slug}`} className="text-sm font-semibold text-ink underline-offset-4 hover:underline">
                    See the syllabus
                  </Link>
                  <Link
                    href={first ? "/tracks" : "/placement/python-for-ai"}
                    aria-label={first ? `Start ${track.name}` : "Take the Python placement check"}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-onlime transition-transform group-hover:translate-x-1"
                  >
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

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
