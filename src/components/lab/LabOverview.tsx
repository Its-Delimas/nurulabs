"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Clock, Flag, Target } from "lucide-react";
import type { Lab } from "@/lib/curriculum/types";
import { moduleOfLab, trackOfLab } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import Logo from "@/components/landing/Logo";
import { stepMeta } from "./StepRail";

/** The syllabus page for one lab: what you'll learn and how the lab runs. */
export default function LabOverview({
  lab,
  done,
  onStart,
}: {
  lab: Lab;
  done: Set<string>;
  onStart: () => void;
}) {
  const progress = useProgress();
  const track = trackOfLab(lab.slug, progress);
  const mod = moduleOfLab(lab.slug, progress);
  const started = done.size > 0;

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="flex items-center justify-between border-b border-ink/10 bg-paper px-6 md:px-10 xl:px-16 py-3">
        <div className="flex items-center gap-4">
          <Logo withWordmark={false} />
          {track && (
            <Link
              href={`/tracks/${track.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-ink"
            >
              <ArrowLeft size={15} />
              {track.name} syllabus
            </Link>
          )}
        </div>
      </header>

      <main className="grid w-full flex-1 gap-10 px-6 md:px-10 xl:px-16 py-10 md:grid-cols-[minmax(0,1fr)_400px] md:py-14">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="eyebrow text-lime-deep">
            {mod ? `Module ${mod.index + 1} · ${mod.module.title}` : track?.name}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
            {lab.kind === "project" ? "Project: " : ""}
            {lab.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink/60">{lab.summary}</p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink/55">
            <span className="inline-flex items-center gap-1.5">
              <Clock size={15} /> About {lab.minutes} minutes
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Target size={15} /> {lab.steps.length} activities
            </span>
          </div>

          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ink">What you&apos;ll be able to do</h2>
            <ul className="mt-4 space-y-2.5">
              {lab.skills.map((s) => (
                <li key={s} className="flex items-start gap-3 text-[15px] text-ink/80">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-onlime">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ink">Lab outline</h2>
            <ol className="mt-4 overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/10">
              {lab.steps.map((step, i) => {
                const meta = stepMeta(step);
                const isDone = done.has(step.id);
                return (
                  <li key={step.id} className="flex items-center gap-4 border-t border-ink/5 px-5 py-3.5 first:border-t-0">
                    <span className="w-5 font-mono text-xs text-ink/35">{i + 1}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        isDone ? "bg-lime text-onlime" : "bg-cream text-ink/55"
                      }`}
                    >
                      {isDone ? <Check size={14} strokeWidth={3} /> : <meta.icon size={14} />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold tracking-wide text-ink/40 uppercase">{meta.label}</p>
                      <p className="truncate text-sm font-medium text-ink">{step.title}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:sticky md:top-8 md:self-start"
        >
          <div className="overflow-hidden rounded-3xl bg-paper text-ink ring-1 ring-ink/10">
            {lab.cover && (
              <div className="relative aspect-[16/10]">
                <Image src={lab.cover.src} alt={lab.cover.alt} fill sizes="380px" className="object-cover" />
              </div>
            )}
            <div className="p-6">
              <p className="text-sm leading-relaxed text-ink/60">
                Every lab runs the same loop: short <span className="font-semibold text-ink">lessons</span>, an{" "}
                <span className="font-semibold text-ink">interactive</span> to build intuition, a quick{" "}
                <span className="font-semibold text-ink">quiz</span>, then real Python you write and run — and finally you{" "}
                <span className="font-semibold text-ink">reflect</span> in your own words.
              </p>
              <button
                type="button"
                onClick={onStart}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-lime px-6 py-3.5 text-sm font-semibold text-onlime"
              >
                {started ? `Resume — ${done.size}/${lab.steps.length} done` : "Start lab"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {mod?.module.milestone && (
            <div className="mt-4 flex gap-3 rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
              <Flag size={18} className="mt-0.5 shrink-0 text-lime-deep" />
              <div>
                <p className="text-xs font-semibold text-ink/45">Counts toward milestone</p>
                <p className="mt-1 font-display text-sm font-semibold text-ink">{mod.module.milestone.title}</p>
              </div>
            </div>
          )}
        </motion.aside>
      </main>
    </div>
  );
}
