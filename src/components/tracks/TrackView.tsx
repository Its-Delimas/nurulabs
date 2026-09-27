"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpen, Check, ChevronDown, Clock, Flag, Hammer, Lock } from "lucide-react";
import type { Lab, Track } from "@/lib/curriculum/types";
import {
  canWorkOnTrack,
  enrolledTrack,
  isLabDone,
  isModuleDone,
  labAccess,
  labLabel,
  labNumber,
  moduleLabs,
  trackLabs,
  trackStats,
} from "@/lib/curriculum";
import { useProgress, type Progress } from "@/lib/progress";
import ProgressBar from "@/components/ui/ProgressBar";
import { stepMeta } from "@/components/lab/StepRail";
import EnrollAction from "./EnrollAction";

export default function TrackView({ track }: { track: Track }) {
  const progress = useProgress();
  const stats = trackStats(track, progress);
  const workable = canWorkOnTrack(track, progress);
  const isEnrolled = enrolledTrack(progress)?.slug === track.slug;
  const minutes = trackLabs(track).reduce((s, l) => s + l.minutes, 0);
  const milestones = track.modules.filter((m) => m.milestone);
  const next = stats.next;
  const nextStarted = next && progress?.labs[next.slug]?.steps.length;
  const soon = track.status === "coming-soon";
  const plannedCount = track.modules.reduce((n, m) => n + (m.planned?.length ?? 0), 0);

  return (
    <div>
      {/* Hero */}
      <section className="grid overflow-hidden rounded-[28px] bg-paper text-ink ring-1 ring-ink/10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="p-7 md:p-10">
          <p className="eyebrow text-lime-deep">
            {isEnrolled ? "Your track" : soon ? "Planned syllabus" : "Track syllabus"} · {track.level}
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight">{track.name}</h1>
          <p className="mt-4 max-w-xl leading-relaxed text-ink/60">{track.description}</p>

          <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {soon ? (
              <>
                <Stat label="Modules planned" value={String(track.modules.length)} />
                <Stat label="Lessons planned" value={String(plannedCount)} />
              </>
            ) : (
              <>
                <Stat label="Labs" value={String(stats.total)} />
                <Stat label="Milestones" value={String(milestones.length)} />
                <Stat label="Hands-on" value={`~${Math.max(1, Math.round(minutes / 60))} hrs`} />
              </>
            )}
            {workable && <Stat label="Complete" value={progress ? `${stats.percent}%` : "—"} />}
          </dl>
          {soon && (
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/55">
              This is the plan for the track. Labs are being written now, and this page fills in as they go live.
            </p>
          )}

          {workable && (
            <div className="mt-6 max-w-sm">
              <ProgressBar value={stats.percent} />
            </div>
          )}

          <div className="mt-8">
            {workable && next ? (
              <Link
                href={`/labs/${next.slug}`}
                className="inline-flex items-center gap-2 rounded-md bg-lime px-6 py-3 text-sm font-semibold text-onlime"
              >
                {nextStarted ? "Continue" : stats.done === 0 ? "Start" : "Next"}: {next.title}
                <ArrowRight size={16} />
              </Link>
            ) : (
              <EnrollAction track={track} progress={progress} />
            )}
          </div>
        </div>
        {track.cover && (
          <div className="relative min-h-56">
            <Image src={track.cover.src} alt={track.cover.alt} fill priority sizes="(min-width: 768px) 440px, 100vw" className="object-cover" />
          </div>
        )}
      </section>

      {/* Milestones at a glance */}
      {milestones.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold text-ink">Milestones</h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {milestones.map((m, i) => {
              const reached = isModuleDone(m, progress);
              return (
                <li
                  key={m.slug}
                  className={`rounded-2xl p-4 ${reached ? "bg-lime-soft ring-1 ring-lime-deep/15" : "bg-paper ring-1 ring-ink/10"}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                        reached ? "bg-lime-deep text-paper" : "bg-cream text-ink/50"
                      }`}
                    >
                      {reached ? <Check size={12} strokeWidth={3} /> : i + 1}
                    </span>
                    <Flag size={13} className={reached ? "text-lime-deep" : "text-ink/30"} />
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-snug text-ink">{m.milestone!.title}</p>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Syllabus */}
      <section className="mt-12">
        <h2 className="font-display text-lg font-semibold text-ink">Syllabus</h2>
        <div className="mt-5 space-y-6">
          {track.modules.map((mod, mi) => {
            const labs = moduleLabs(mod);
            const reached = isModuleDone(mod, progress);
            return (
              <div key={mod.slug} className="overflow-hidden rounded-3xl bg-paper ring-1 ring-ink/10">
                <div className="flex items-start justify-between gap-4 border-b border-ink/5 px-6 py-5">
                  <div>
                    <p className="eyebrow text-ink/40">Module {mi + 1}</p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-ink">{mod.title}</h3>
                    <p className="mt-1 text-sm text-ink/55">{mod.summary}</p>
                  </div>
                  {labs.length > 0 && (
                    <span className="shrink-0 text-xs font-medium text-ink/40">
                      {labs.filter((l) => isLabDone(progress, l.slug)).length}/{labs.length} labs
                    </span>
                  )}
                </div>

                <ul>
                  {labs.map((lab) => (
                    <LabRow key={lab.slug} lab={lab} track={track} progress={progress} workable={workable} isNext={workable && next?.slug === lab.slug} />
                  ))}
                  {mod.planned?.map((p) => (
                    <li key={p.title} className="flex items-center gap-4 border-t border-ink/5 px-6 py-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-ink/20 text-ink/30">
                        <Hammer size={13} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink/45">{p.title}</p>
                        <p className="text-xs text-ink/35">{p.summary} · being built</p>
                      </div>
                    </li>
                  ))}
                </ul>

                {mod.milestone && (
                  <div className={`flex items-start gap-3 px-6 py-4 ${reached ? "bg-lime-soft" : "bg-cream/70"}`}>
                    <Flag size={16} className={`mt-0.5 shrink-0 ${reached ? "text-lime-deep" : "text-ink/35"}`} />
                    <div>
                      <p className="text-xs font-semibold text-ink/50">
                        Milestone {mi + 1} {reached ? "· reached" : ""}
                      </p>
                      <p className="text-sm font-semibold text-ink">{mod.milestone.title}</p>
                      <p className="mt-0.5 text-xs text-ink/55">{mod.milestone.description}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink/45">{label}</dt>
      <dd className="mt-0.5 font-display text-xl font-semibold">{value}</dd>
    </div>
  );
}

function LabRow({
  lab,
  track,
  progress,
  workable,
  isNext,
}: {
  lab: Lab;
  track: Track;
  progress: Progress | null;
  workable: boolean;
  isNext: boolean;
}) {
  const [open, setOpen] = useState(isNext);
  const done = isLabDone(progress, lab.slug);
  const canOpen = workable && labAccess(lab.slug, progress).open;
  const doneSteps = new Set(progress?.labs[lab.slug]?.steps ?? []);
  const isProject = lab.kind === "project";

  return (
    <li className={`border-t border-ink/5 ${isNext ? "bg-lime-soft/40" : ""}`}>
      <div className="flex items-center gap-4 px-6 py-4">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
            done ? "bg-lime-deep text-paper" : isNext ? "bg-lime text-onlime" : canOpen ? "bg-cream text-ink/60" : "bg-cream text-ink/30"
          }`}
        >
          {done ? <Check size={14} strokeWidth={3} /> : !canOpen ? <Lock size={12} /> : isProject ? <Flag size={13} /> : labNumber(lab.slug, track)}
        </span>
        <button type="button" onClick={() => setOpen((o) => !o)} className="min-w-0 flex-1 text-left">
          <p className="text-xs text-ink/40">
            {labLabel(lab, track)} · {lab.subject}
          </p>
          <p className="truncate font-display text-base font-semibold text-ink">{lab.title}</p>
        </button>
        <span className="hidden items-center gap-1 text-xs text-ink/40 sm:inline-flex">
          <Clock size={12} /> {lab.minutes} min
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Hide lab outline" : "Show lab outline"}
          aria-expanded={open}
          className="rounded-md p-1.5 text-ink/40 hover:bg-cream hover:text-ink"
        >
          <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
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
            <div className="px-6 pb-5 sm:pl-[72px]">
              <p className="text-sm leading-relaxed text-ink/60">{lab.summary}</p>
              <ol className="mt-4 space-y-1.5">
                {lab.steps.map((s) => {
                  const meta = stepMeta(s);
                  const sDone = doneSteps.has(s.id) || done;
                  return (
                    <li key={s.id} className="flex items-center gap-3 text-sm">
                      <meta.icon size={14} className={sDone ? "text-lime-deep" : "text-ink/35"} />
                      <span className="w-20 shrink-0 text-xs font-semibold text-ink/40">{meta.label}</span>
                      <span className={`truncate ${sDone ? "text-ink/45" : "text-ink/80"}`}>{s.title}</span>
                    </li>
                  );
                })}
              </ol>
              {canOpen && (
                <Link
                  href={`/labs/${lab.slug}`}
                  className="mt-5 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper"
                >
                  <BookOpen size={15} />
                  {done ? "Review lab" : doneSteps.size ? "Continue lab" : "Open lab"}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
