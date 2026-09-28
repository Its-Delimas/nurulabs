"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ClipboardCheck, Flag, Hammer } from "lucide-react";
import { tracks } from "@/lib/curriculum/tracks";

/** Lab counts per track come from the server (app/page.tsx), keeping lab content out of this bundle. */
export default function Path({ labCounts }: { labCounts: Record<string, number> }) {
  const [python, ...rest] = tracks;
  const next = rest.filter((t) => t.status === "active");
  const soon = rest.filter((t) => t.status !== "active");

  return (
    <section id="tracks" className="scroll-mt-20 bg-paper py-24 md:py-32">
      <div className="px-6 md:px-10 xl:px-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="eyebrow text-lime-deep"
        >
          A programme, not a playlist
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.05 }}
          className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight text-ink md:text-4xl"
        >
          Enroll in one track. Finish it. Move up.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.1 }}
          className="mt-5 max-w-2xl text-ink/60"
        >
          Every track is a syllabus of modules, each ending in a milestone — a thing you can now do. Everything
          builds on Python, so that&apos;s where the path starts; then choose AI &amp; Machine Learning or Data
          Science. Already code in Python? Take the placement check and go straight to step two.
        </motion.p>

        <div className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {[python, ...next].map((track, i) => {
            const labCount = labCounts[track.slug] ?? 0;
            const milestones = track.modules.filter((m) => m.milestone);
            return (
              <motion.article
                key={track.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col overflow-hidden rounded-[28px] bg-cream ring-1 ring-ink/10"
              >
                {track.cover && (
                  <div className="relative aspect-[16/8]">
                    <Image src={track.cover.src} alt={track.cover.alt} fill sizes="(min-width: 768px) 560px, 100vw" className="object-cover" />
                    <span className="absolute top-4 left-4 rounded-md bg-lime px-2.5 py-1 font-mono text-xs font-semibold text-onlime">
                      {i === 0 ? "STEP 1" : "STEP 2 · CHOOSE ONE"}
                    </span>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-7">
                  <p className="text-xs font-semibold text-ink/45">
                    {track.level} · {labCount} lab{labCount === 1 ? "" : "s"}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{track.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/60">{track.description}</p>
                  <ol className="mt-6 space-y-2.5">
                    {milestones.map((m, mi) => (
                      <li key={m.slug} className="flex items-start gap-3 text-sm">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-paper font-mono text-[10px] font-semibold text-ink/55">
                          {mi + 1}
                        </span>
                        <span className="text-ink/75">
                          <Flag size={12} className="mr-1.5 inline text-lime-deep" />
                          {m.milestone!.title}
                        </span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-auto pt-7">
                    {i === 0 ? (
                      <Link href="/tracks" className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-semibold text-paper">
                        Start here — no experience needed
                        <ArrowRight size={15} />
                      </Link>
                    ) : (
                      <Link
                        href="/placement/python-for-ai"
                        className="inline-flex items-center gap-2 rounded-md border border-ink/15 px-5 py-3 text-sm font-semibold text-ink"
                      >
                        <ClipboardCheck size={15} />
                        Know Python? Take the placement check
                      </Link>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {soon.map((t) => (
            <Link key={t.slug} href={`/tracks/${t.slug}`} className="inline-flex items-center gap-2 rounded-xl border border-dashed border-ink/15 px-4 py-2.5 text-sm text-ink/45 hover:border-ink/30 hover:text-ink/70">
              <Hammer size={14} />
              {t.name} — being built · see the plan
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
