"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Clock, Flag, Hammer, Lock } from "lucide-react";
import type { LabSummary, Module, Track } from "@/lib/curriculum/types";
import { isLabDone, isModuleDone, labAccess, labLabel, moduleLabs } from "@/lib/curriculum";
import type { Progress } from "@/lib/progress";
import { stepMeta, stepTone as tone, stepTones as tones } from "@/components/lab/StepRail";
import RichText from "@/components/lab/RichText";
import SectionHeading from "./SectionHeading";
import { plural } from "./format";
import { isModuleLocked } from "./moduleLock";


export default function TrackSyllabus({
  track,
  progress,
  workable,
  nextSlug,
}: {
  track: Track;
  progress: Progress | null;
  workable: boolean;
  nextSlug?: string;
}) {
  const active = useActiveModule(track.modules.map((m) => m.slug));

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Syllabus" title="Every module and lab" />
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink/55" aria-label="Activity types">
          {Object.entries(tones).map(([label, cls]) => (
            <li key={label} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${cls}`} />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Module index, pinned while the syllabus scrolls */}
        <nav aria-label="Modules" className="hidden lg:sticky lg:top-8 lg:block lg:self-start">
          <ol className="space-y-1 border-l border-ink/10">
            {track.modules.map((mod, i) => {
              const labs = moduleLabs(mod);
              const done = labs.length > 0 && isModuleDone(mod, progress);
              const current = !!nextSlug && mod.labs.includes(nextSlug);
              const locked = isModuleLocked(mod, progress, workable);
              const here = active === mod.slug;
              return (
                <li key={mod.slug}>
                  <a
                    href={`#module-${mod.slug}`}
                    aria-current={here ? "location" : undefined}
                    className={`-ml-px flex items-start gap-2 border-l-2 py-1.5 pl-4 text-sm transition-colors ${
                      here
                        ? "border-lime-deep font-semibold text-ink"
                        : locked
                          ? "border-transparent text-ink/35 hover:text-ink/60"
                          : "border-transparent text-ink/55 hover:text-ink"
                    }`}
                  >
                    <span className="w-5 shrink-0 font-mono text-xs leading-5 text-ink/35">
                      {done ? <Check size={13} className="mt-1 text-lime-deep" /> : locked ? <Lock size={12} className="mt-1" /> : i + 1}
                    </span>
                    <span className="leading-snug">
                      {mod.title}
                      {current && <span className="ml-1.5 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-lime-deep" title="You're here" />}
                    </span>
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="space-y-14">
          {track.modules.map((mod, i) => (
            <ModuleSection key={mod.slug} mod={mod} index={i} track={track} progress={progress} workable={workable} nextSlug={nextSlug} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModuleSection({
  mod,
  index,
  track,
  progress,
  workable,
  nextSlug,
}: {
  mod: Module;
  index: number;
  track: Track;
  progress: Progress | null;
  workable: boolean;
  nextSlug?: string;
}) {
  const labs = moduleLabs(mod);
  const reached = labs.length > 0 && isModuleDone(mod, progress);
  const doneCount = labs.filter((l) => isLabDone(progress, l.slug)).length;
  const activities = labs.reduce((s, l) => s + l.steps.length, 0);
  const locked = isModuleLocked(mod, progress, workable);

  return (
    <section id={`module-${mod.slug}`} className="scroll-mt-8">
      <header className="flex flex-wrap items-start gap-x-6 gap-y-3 border-t border-ink/10 pt-6">
        <span className="font-display text-5xl font-semibold leading-none tracking-tight text-ink/15 md:w-20 md:text-6xl">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0 flex-1">
          {(locked || mod.optional) && (
            <div className="mb-2 flex flex-wrap gap-2">
              {mod.optional && (
                <span className="inline-flex items-center rounded-full bg-sun/15 px-2.5 py-1 text-xs font-semibold text-sun">
                  Optional bonus · doesn&apos;t count towards finishing the track
                </span>
              )}
              {locked && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold text-ink/50">
                  <Lock size={12} /> {mod.optional ? "Opens when you finish the track" : `Unlocks when you finish module ${index}`}
                </span>
              )}
            </div>
          )}
          <h3 className={`font-display text-2xl font-semibold tracking-tight ${locked ? "text-ink/50" : "text-ink"}`}>{mod.title}</h3>
          <p className="mt-1 max-w-2xl text-ink/60">
            <RichText text={mod.summary} />
          </p>
          <p className="mt-2 text-xs font-medium text-ink/45">
            {labs.length
              ? `${plural(labs.length, "lab")} · ${activities} activities`
              : `${mod.planned?.length ?? 0} lessons planned`}
          </p>
        </div>
        {workable && labs.length > 0 && (
          <div className="hidden sm:block">
            <Ring done={doneCount} total={labs.length} />
          </div>
        )}
      </header>

      <ul className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {labs.map((lab) => (
          <LabCard key={lab.slug} lab={lab} track={track} progress={progress} workable={workable} isNext={lab.slug === nextSlug} />
        ))}
        {mod.planned?.map((p) => (
          <li key={p.title} className="flex flex-col rounded-2xl border border-dashed border-ink/20 p-5">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink/40">
              <Hammer size={12} /> Being built
            </span>
            <p className="mt-3 font-display text-base font-semibold text-ink/55">{p.title}</p>
            <p className="mt-1 text-sm text-ink/45">
              <RichText text={p.summary} />
            </p>
          </li>
        ))}
      </ul>

      {mod.milestone && (
        <div
          className={`mt-4 flex items-start gap-4 rounded-2xl p-5 ${
            reached ? "bg-lime text-onlime" : "bg-paper ring-1 ring-ink/10"
          }`}
        >
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              reached ? "bg-onlime text-lime" : "bg-cream text-ink/40"
            }`}
          >
            <Flag size={17} />
          </span>
          <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${reached ? "text-onlime/60" : "text-ink/45"}`}>
              Milestone {index + 1}
              {reached ? " · reached" : ""}
            </p>
            <p className={`mt-0.5 font-display text-lg font-semibold ${reached ? "" : "text-ink"}`}>{mod.milestone.title}</p>
            <p className={`mt-1 text-sm ${reached ? "text-onlime/75" : "text-ink/60"}`}>{mod.milestone.description}</p>
          </div>
        </div>
      )}
    </section>
  );
}

function LabCard({
  lab,
  track,
  progress,
  workable,
  isNext,
}: {
  lab: LabSummary;
  track: Track;
  progress: Progress | null;
  workable: boolean;
  isNext: boolean;
}) {
  const [open, setOpen] = useState(false);
  const done = isLabDone(progress, lab.slug);
  const canOpen = workable && labAccess(lab.slug, progress).open;
  const doneSteps = new Set(progress?.labs[lab.slug]?.steps ?? []);
  const isProject = lab.kind === "project";

  const locked = workable && !canOpen && !done;

  const status = done ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-lime-deep px-2.5 py-1 text-xs font-semibold text-paper">
      <Check size={12} strokeWidth={3} /> Done
    </span>
  ) : isNext ? (
    <span className="rounded-full bg-lime px-2.5 py-1 text-xs font-semibold text-onlime">Up next</span>
  ) : locked ? (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/5 text-ink/40" title="Locked" aria-label="Locked">
      <Lock size={13} />
    </span>
  ) : null;

  return (
    <li
      className={`flex flex-col rounded-2xl p-5 transition-shadow ${
        locked
          ? "bg-ink/[0.03] ring-1 ring-ink/10"
          : done
            ? "bg-lime-soft ring-1 ring-lime-deep/30"
            : `bg-paper ${isNext ? "ring-2 ring-lime-deep" : isProject ? "ring-1 ring-ink/25" : "ring-1 ring-ink/10"}`
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-ink/45">
          {isProject && <Flag size={12} className="mr-1 inline -translate-y-px text-lime-deep" />}
          {labLabel(lab, track)} · <span className="font-medium">{lab.subject}</span>
          {lab.format === "thinking" && <span className="ml-1.5 rounded-full bg-violet/15 px-2 py-0.5 text-[11px] font-semibold text-violet">Thinking lab</span>}
        </p>
        {status}
      </div>
      <div className={locked ? "opacity-55" : ""}>
        <p className="mt-2 font-display text-lg font-semibold leading-snug text-ink">{lab.title}</p>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink/60">
          <RichText text={lab.summary} />
        </p>

        {/* One segment per activity, coloured by kind; finished ones stay solid */}
        <div className="mt-4 flex gap-1" aria-hidden>
          {lab.steps.map((s) => (
            <span
              key={s.id}
              className={`h-1.5 flex-1 rounded-full ${tone(s)} ${done || doneSteps.has(s.id) || !workable ? "" : "opacity-35"}`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 pt-1">
        <span className="inline-flex items-center gap-3 text-xs text-ink/50">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} /> {lab.minutes} min
          </span>
          <span>{lab.steps.length} activities</span>
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-ink/55 hover:bg-cream hover:text-ink"
          >
            Outline
            <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
          {canOpen && (
            <Link
              href={`/labs/${lab.slug}`}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold ${
                isNext ? "bg-lime text-onlime" : "bg-ink text-paper"
              }`}
            >
              {done ? "Review" : doneSteps.size ? "Continue" : "Open"}
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <ol className="mt-4 space-y-2 border-t border-ink/10 pt-4">
              {lab.steps.map((s) => {
                const meta = stepMeta(s);
                const sDone = done || doneSteps.has(s.id);
                return (
                  <li key={s.id} className="flex items-center gap-2.5 text-sm">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${tone(s)}`} />
                    <span className="w-20 shrink-0 text-xs font-semibold text-ink/45">{meta.label}</span>
                    <span className={`min-w-0 truncate ${sDone ? "text-ink/45 line-through decoration-ink/20" : "text-ink/80"}`}>{s.title}</span>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

/** A small progress ring: labs done out of the module's total. */
function Ring({ done, total }: { done: number; total: number }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  const frac = total ? done / total : 0;
  return (
    <div className="flex items-center gap-3">
      <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90" aria-hidden>
        <circle cx="26" cy="26" r={r} fill="none" strokeWidth="5" className="stroke-ink/10" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          className="stroke-lime-deep transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="text-sm">
        <span className="font-display text-lg font-semibold text-ink">
          {done}/{total}
        </span>
        <span className="block text-xs text-ink/45">labs done</span>
      </span>
    </div>
  );
}

/** The module section nearest the top of the viewport, for highlighting the index as you scroll. */
function useActiveModule(slugs: string[]) {
  const [active, setActive] = useState<string | undefined>(slugs[0]);
  const key = slugs.join(",");

  useEffect(() => {
    const ids = key.split(",");
    const els = ids.map((s) => document.getElementById(`module-${s}`)).filter((e): e is HTMLElement => !!e);
    const onScroll = () => {
      // The last section whose top has passed a line a quarter of the way down the screen.
      const line = window.innerHeight * 0.25;
      let current = ids[0];
      for (const el of els) if (el.getBoundingClientRect().top <= line) current = el.id.slice("module-".length);
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [key]);

  return active;
}
