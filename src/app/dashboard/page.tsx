"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, Flag, Lock, Trophy } from "lucide-react";
import type { Module, Track } from "@/lib/curriculum/types";
import AppShell from "@/components/dashboard/AppShell";
import StreakCalendar from "@/components/dashboard/StreakCalendar";
import TrackCatalog from "@/components/tracks/TrackCatalog";
import { stepMeta } from "@/components/lab/StepRail";
import RichText from "@/components/lab/RichText";
import ProgressBar from "@/components/ui/ProgressBar";
import { button } from "@/components/ui/button";
import {
  bonusLabs,
  enrolledTrack,
  isLabDone,
  isModuleDone,
  labAccess,
  labLabel,
  labNumber,
  moduleLabs,
  trackLabs,
  trackStats,
  tracksUnlockedBy,
} from "@/lib/curriculum";
import { displayName, useAuth } from "@/lib/auth";
import { useActivityDates, useProgress, type Progress } from "@/lib/progress";

export default function DashboardPage() {
  const progress = useProgress();
  const activeDates = useActivityDates();
  const { user } = useAuth();
  const track = enrolledTrack(progress);

  if (!progress) {
    return (
      <AppShell>
        <div className="h-96 animate-pulse rounded-2xl bg-ink/5" aria-label="Loading your learning" />
      </AppShell>
    );
  }

  // Not enrolled yet: the dashboard is the place to choose a track.
  if (!track) {
    return (
      <AppShell>
        <TrackCatalog />
      </AppShell>
    );
  }

  const stats = trackStats(track, progress);
  const labs = trackLabs(track);
  const stepsDone = labs.reduce((s, l) => s + (progress.labs[l.slug]?.steps.length ?? 0), 0);
  const required = track.modules.filter((m) => !m.optional && moduleLabs(m).length > 0);
  const milestonesReached = required.filter((m) => isModuleDone(m, progress)).length;
  const firstName = user ? displayName(user).split(/\s+/)[0] : null;
  const greeting = stepsDone === 0 ? "Karibu, let's begin" : `Karibu back${firstName ? `, ${firstName}` : ""}`;

  return (
    <AppShell>
      <header>
        <p className="eyebrow text-lime-deep">{track.name}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">{greeting}</h1>
      </header>

      {/* One column on small screens, in the order a learner needs it; two on wide screens. */}
      <div
        className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 [grid-template-areas:'continue'_'progress'_'path'_'skills'_'streak']
          xl:grid-cols-[minmax(0,1fr)_320px] xl:[grid-template-areas:'continue_progress'_'path_streak'_'skills_streak']"
      >
        <div className="min-w-0 [grid-area:continue]">
          {stats.complete ? <TrackComplete track={track} progress={progress} /> : <ContinueCard track={track} progress={progress} />}
        </div>

        <section aria-labelledby="progress-title" className="self-start rounded-2xl bg-paper p-6 ring-1 ring-ink/10 [grid-area:progress]">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="progress-title" className="font-display text-base font-semibold text-ink">Your progress</h2>
            <p className="font-display text-3xl font-semibold text-ink">{stats.percent}%</p>
          </div>
          <div className="mt-3">
            <ProgressBar value={stats.percent} label={`${track.name}: ${stats.percent}% complete`} />
          </div>
          {!stats.complete && stats.percent >= 75 && (
            <p className="mt-3 text-sm font-semibold text-lime-deep">
              Almost there: {stats.total - stats.done} {stats.total - stats.done === 1 ? "lab" : "labs"} to finish {track.name}.
            </p>
          )}
          <dl className="mt-5 grid grid-cols-3 divide-x divide-ink/10 border-t border-ink/10 pt-4 text-center">
            <Metric label="Labs" value={`${stats.done}/${stats.total}`} />
            <Metric label="Milestones" value={`${milestonesReached}/${required.length}`} />
            <Metric label="Activities" value={String(stepsDone)} />
          </dl>
        </section>

        <div className="min-w-0 [grid-area:path]">
          <ModulePath track={track} progress={progress} />
        </div>

        <div className="min-w-0 [grid-area:skills]">
          <Skills track={track} progress={progress} />
        </div>

        <section className="self-start rounded-2xl bg-paper p-6 ring-1 ring-ink/10 [grid-area:streak]">
          <StreakCalendar activeDates={activeDates} />
        </section>
      </div>
    </AppShell>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col px-2">
      <dt className="order-2 mt-0.5 text-xs text-ink/60">{label}</dt>
      <dd className="order-1 font-display text-xl font-semibold text-ink">{value}</dd>
    </div>
  );
}

function ContinueCard({ track, progress }: { track: Track; progress: Progress }) {
  const lab = trackStats(track, progress).next!;
  const done = new Set(progress.labs[lab.slug]?.steps ?? []);
  const started = done.size > 0;
  const nextStep = lab.steps.find((s) => !done.has(s.id)) ?? lab.steps[0];
  const cover = lab.cover ?? track.cover;
  const mi = track.modules.findIndex((m) => m.labs.includes(lab.slug));

  return (
    <motion.section
      aria-labelledby="continue-title"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-1 overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
    >
      <div className="p-6 md:p-8">
        <p className="eyebrow text-lime-deep">
          {started ? "Continue" : "Up next"} · Module {mi + 1} · {labLabel(lab, track)}
        </p>
        <h2 id="continue-title" className="mt-3 font-display text-2xl font-semibold leading-tight text-ink md:text-3xl">
          {lab.title}
        </h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/70">
          <RichText text={lab.summary} />
        </p>

        <div className="mt-6">
          <p className="sr-only">
            {done.size} of {lab.steps.length} activities done
          </p>
          <ol className="flex gap-1" aria-hidden="true">
            {lab.steps.map((s) => {
              const meta = stepMeta(s);
              const isDone = done.has(s.id);
              const isNext = s.id === nextStep.id;
              return (
                <li
                  key={s.id}
                  title={`${meta.label}: ${s.title}`}
                  className={`flex h-7 flex-1 items-center justify-center rounded-md ${
                    isDone ? "bg-lime text-onlime" : isNext ? "bg-ink text-paper" : "bg-cream text-ink/40"
                  }`}
                >
                  <meta.icon size={13} />
                </li>
              );
            })}
          </ol>
          <p className="mt-3 text-sm text-ink/60">
            {started ? "Next up: " : "Starts with: "}
            <span className="text-ink">
              {stepMeta(nextStep).label}, <RichText text={nextStep.title} />
            </span>
          </p>
        </div>

        <Link href={`/labs/${lab.slug}`} className={button({ size: "lg", className: "mt-7" })}>
          {started ? "Resume lab" : lab.kind === "project" ? "Start project" : `Start lab ${labNumber(lab.slug, track)}`}
          <ArrowRight size={17} />
        </Link>
      </div>
      {cover && (
        <div className="relative hidden min-h-56 md:block">
          <Image src={cover.src} alt={cover.alt} fill sizes="360px" className="object-cover" priority />
        </div>
      )}
    </motion.section>
  );
}

function TrackComplete({ track, progress }: { track: Track; progress: Progress }) {
  const unlocked = tracksUnlockedBy(track).filter((t) => t.status === "active");
  const bonus = bonusLabs(track).find((l) => !isLabDone(progress, l.slug));
  const bonusModule = bonus && track.modules.find((m) => m.labs.includes(bonus.slug));
  return (
    <section aria-labelledby="complete-title" className="rounded-2xl bg-paper p-6 ring-1 ring-ink/10 md:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime text-onlime">
        <Trophy size={20} />
      </span>
      <h2 id="complete-title" className="mt-4 font-display text-3xl font-semibold text-ink">
        You finished {track.name}.
      </h2>
      <p className="mt-2 max-w-md leading-relaxed text-ink/70">
        Every required lab and milestone.{" "}
        {unlocked.length
          ? `${new Intl.ListFormat("en", { type: "conjunction" }).format(unlocked.map((t) => t.name))} ${unlocked.length === 1 ? "is" : "are"} open to you now.`
          : "New tracks are on the way."}
      </p>
      <Link href="/tracks" className={button({ size: "lg", className: "mt-6" })}>
        Choose your next track
        <ArrowRight size={17} />
      </Link>
      {bonus && bonusModule && (
        <p className="mt-5 text-sm text-ink/65">
          Optional bonus:{" "}
          <Link href={`/labs/${bonus.slug}`} className="font-semibold text-ink underline underline-offset-4">
            {bonusModule.title}
          </Link>
          , whenever you want it.
        </p>
      )}
    </section>
  );
}

/** The first required module that isn't finished: where the learner is now. */
function currentModule(track: Track, progress: Progress) {
  return track.modules.find((m) => !m.optional && moduleLabs(m).length > 0 && !isModuleDone(m, progress));
}

function ModulePath({ track, progress }: { track: Track; progress: Progress }) {
  const modules = track.modules.filter((m) => moduleLabs(m).length > 0);
  const current = currentModule(track, progress);

  return (
    <section aria-labelledby="path-title">
      <div className="flex items-end justify-between gap-4">
        <h2 id="path-title" className="font-display text-xl font-semibold text-ink">
          Your path
        </h2>
        <Link href={`/tracks/${track.slug}`} className="inline-flex items-center gap-1 text-sm font-semibold text-ink/70 hover:text-ink">
          Full syllabus <ArrowRight size={15} />
        </Link>
      </div>
      <ol className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/10">
        {modules.map((m) => {
          const labs = moduleLabs(m);
          const reached = isModuleDone(m, progress);
          const isCurrent = m === current;
          const open = labs.some((l) => labAccess(l.slug, progress).open);
          const doneCount = labs.filter((l) => isLabDone(progress, l.slug)).length;
          const number = track.modules.indexOf(m) + 1;
          const state = reached ? "Finished" : isCurrent ? "In progress" : open ? "Open" : "Locked";
          return (
            <li key={m.slug} className={`px-5 py-4 ${isCurrent ? "bg-lime-soft/50" : ""}`}>
              <div className="flex items-center gap-4">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    reached ? "bg-lime-deep text-paper" : isCurrent ? "bg-ink text-paper" : "bg-cream text-ink/50"
                  }`}
                >
                  {reached ? <Check size={15} strokeWidth={3} /> : isCurrent ? <Flag size={14} /> : <Lock size={13} />}
                  <span className="sr-only">{state}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-ink/60">
                    Module {number} · {m.title}
                    {m.optional && <span className="ml-2 rounded bg-sun/20 px-1.5 py-0.5 text-[11px] font-semibold text-ink/75">Bonus</span>}
                  </p>
                  <p className={`mt-0.5 font-semibold ${reached || isCurrent ? "text-ink" : "text-ink/60"}`}>{m.milestone?.title ?? m.title}</p>
                </div>
                <span className="shrink-0 text-sm tabular-nums text-ink/60">
                  {doneCount}/{labs.length}
                  <span className="sr-only"> labs done</span>
                </span>
              </div>
              {isCurrent && (
                <ul className="mt-3 flex flex-wrap gap-2 pl-12">
                  {labs.map((l) => {
                    const d = isLabDone(progress, l.slug);
                    const canOpen = labAccess(l.slug, progress).open;
                    const cls = `inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                      d ? "bg-lime-deep/10 text-lime-deep" : canOpen ? "bg-paper text-ink ring-1 ring-ink/15" : "bg-cream text-ink/50"
                    }`;
                    return (
                      <li key={l.slug}>
                        {canOpen ? (
                          <Link href={`/labs/${l.slug}`} className={`${cls} hover:ring-ink/40`}>
                            {d && <Check size={11} strokeWidth={3} />}
                            {l.title}
                          </Link>
                        ) : (
                          <span className={cls}>
                            <Lock size={10} />
                            {l.title}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Skills({ track, progress }: { track: Track; progress: Progress }) {
  const current = currentModule(track, progress);
  const groups = track.modules
    .map((m: Module) => ({
      module: m,
      skills: moduleLabs(m).flatMap((lab) => lab.skills.map((skill) => ({ skill, lab: lab.slug, done: isLabDone(progress, lab.slug) }))),
    }))
    .filter((g) => g.skills.length > 0);
  const total = groups.reduce((n, g) => n + g.skills.length, 0);
  const proven = groups.reduce((n, g) => n + g.skills.filter((s) => s.done).length, 0);

  return (
    <section aria-labelledby="skills-title">
      <h2 id="skills-title" className="font-display text-xl font-semibold text-ink">
        What you can do
      </h2>
      <p className="mt-1 text-sm text-ink/65">
        {proven} of {total} skills proven, by passing each lab&apos;s checks rather than by clicking through lessons.
      </p>
      <div className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/10">
        {groups.map((g) => {
          const done = g.skills.filter((s) => s.done).length;
          return (
            <details key={g.module.slug} open={g.module === current} className="group">
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-3.5 hover:bg-cream/60 [&::-webkit-details-marker]:hidden">
                <span className="min-w-0 flex-1 text-sm">
                  <span className="text-ink/60">Module {track.modules.indexOf(g.module) + 1} · </span>
                  <span className="font-semibold text-ink">{g.module.title}</span>
                </span>
                <span className="text-sm tabular-nums text-ink/60">
                  {done}/{g.skills.length}
                </span>
                <ChevronDown size={16} className="shrink-0 text-ink/50 transition-transform group-open:rotate-180" />
              </summary>
              <ul className="grid gap-x-6 gap-y-2 px-5 pt-1 pb-5 sm:grid-cols-2">
                {g.skills.map((s) => (
                  <li key={s.lab + s.skill} className="flex items-start gap-2.5 text-sm">
                    <span
                      className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                        s.done ? "bg-lime text-onlime" : "ring-1 ring-ink/20"
                      }`}
                    >
                      {s.done && <Check size={11} strokeWidth={3} />}
                    </span>
                    <span className={s.done ? "text-ink" : "text-ink/60"}>
                      <RichText text={s.skill} />
                      {!s.done && <span className="sr-only"> (not yet)</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}
