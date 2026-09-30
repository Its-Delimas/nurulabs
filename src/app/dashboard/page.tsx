"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Flag, Lock, Trophy } from "lucide-react";
import type { Track } from "@/lib/curriculum/types";
import AppShell from "@/components/dashboard/AppShell";
import StreakCalendar from "@/components/dashboard/StreakCalendar";
import WeekBars from "@/components/dashboard/WeekBars";
import TrackCatalog from "@/components/tracks/TrackCatalog";
import { stepMeta } from "@/components/lab/StepRail";
import {
  enrolledTrack,
  isLabDone,
  isModuleDone,
  labLabel,
  labNumber,
  moduleLabs,
  trackLabs,
  trackStats,
  tracksUnlockedBy,
} from "@/lib/curriculum";
import { useActivityDates, useProgress, type Progress } from "@/lib/progress";

export default function DashboardPage() {
  const progress = useProgress();
  const activeDates = useActivityDates();
  const track = enrolledTrack(progress);

  if (!progress) {
    return (
      <AppShell>
        <div className="h-96 animate-pulse rounded-[28px] bg-ink/5" />
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
  const milestonesReached = track.modules.filter((m) => m.milestone && isModuleDone(m, progress)).length;

  return (
    <AppShell>
      <div>
        <p className="eyebrow text-lime-deep">{track.name}</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">
          {stepsDone === 0 ? "Karibu — let's begin" : "Karibu back"}
        </h1>

        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-8">
            {stats.complete ? <TrackComplete track={track} /> : <ContinueCard track={track} progress={progress} />}
            <MilestonePath track={track} progress={progress} />
            <SkillMap track={track} progress={progress} />
          </div>

          <div className="min-w-0 space-y-6">
            <section className="rounded-3xl bg-paper p-6 text-ink ring-1 ring-ink/10">
              <div className="flex items-baseline justify-between gap-3">
                <p className="font-display text-base font-semibold">Your progress</p>
                <p className="font-display text-2xl font-semibold text-lime-deep">{stats.percent}%</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
                <div className="h-full rounded-full bg-lime" style={{ width: `${stats.percent}%` }} />
              </div>
              {!stats.complete && stats.percent >= 75 && (
                <p className="mt-2 text-xs font-semibold text-lime-deep">
                  Almost there: {stats.total - stats.done} {stats.total - stats.done === 1 ? "lab" : "labs"} to finish {track.name}.
                </p>
              )}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Metric value={`${stats.done}/${stats.total}`} label="Labs" />
                <Metric value={String(milestonesReached)} label="Milestones" />
                <Metric value={String(stepsDone)} label="Activities" />
              </div>
              <div className="mt-5 rounded-2xl bg-cream p-4">
                <p className="text-xs text-ink/50">Days you ran code this week</p>
                <div className="mt-3">
                  <WeekBars activeDates={activeDates} />
                </div>
              </div>
            </section>
            <section className="rounded-3xl border border-ink/10 bg-paper p-6">
              <StreakCalendar activeDates={activeDates} />
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-cream p-3">
      <p className="font-display text-xl font-semibold">{value}</p>
      <p className="mt-0.5 text-[11px] text-ink/50">{label}</p>
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="grid overflow-hidden rounded-[28px] bg-paper text-ink ring-1 ring-ink/10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
    >
      <div className="p-7 md:p-8">
        <p className="eyebrow text-lime-deep">
          {started ? "Continue" : "Up next"} · Module {mi + 1} · {labLabel(lab, track)}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-tight">{lab.title}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">{lab.summary}</p>

        <div className="mt-6 flex gap-1.5">
          {lab.steps.map((s) => {
            const meta = stepMeta(s);
            const isDone = done.has(s.id);
            const isNext = s.id === nextStep.id;
            return (
              <span
                key={s.id}
                title={`${meta.label}: ${s.title}`}
                className={`flex h-8 flex-1 items-center justify-center rounded-lg ${
                  isDone ? "bg-lime text-onlime" : isNext ? "bg-ink text-paper" : "bg-cream text-ink/35"
                }`}
              >
                <meta.icon size={13} />
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-ink/50">
          {started ? "Next up: " : "Starts with: "}
          <span className="text-ink/80">
            {stepMeta(nextStep).label} — {nextStep.title}
          </span>
        </p>

        <Link
          href={`/labs/${lab.slug}`}
          className="mt-7 inline-flex items-center gap-2 rounded-md bg-lime px-6 py-3 text-sm font-semibold text-onlime"
        >
          {started ? "Resume lab" : lab.kind === "project" ? "Start project" : `Start lab ${labNumber(lab.slug, track)}`}
          <ArrowRight size={16} />
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

function TrackComplete({ track }: { track: Track }) {
  const unlocked = tracksUnlockedBy(track).filter((t) => t.status === "active");
  return (
    <section className="rounded-[28px] bg-paper p-8 text-ink ring-1 ring-ink/10">
      <Trophy className="text-lime-deep" />
      <h2 className="mt-4 font-display text-3xl font-semibold">You finished {track.name}.</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
        Every lab, every milestone. {unlocked.length ? `${unlocked.map((t) => t.name).join(" and ")} is open to you now.` : "New tracks are on the way."}
      </p>
      <Link href="/tracks" className="mt-6 inline-flex items-center gap-2 rounded-md bg-lime px-6 py-3 text-sm font-semibold text-onlime">
        Choose your next track
        <ArrowRight size={16} />
      </Link>
    </section>
  );
}

function MilestonePath({ track, progress }: { track: Track; progress: Progress }) {
  const modules = track.modules.filter((m) => moduleLabs(m).length > 0);
  const currentIdx = modules.findIndex((m) => !isModuleDone(m, progress));

  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Your milestones</h2>
        <Link href={`/tracks/${track.slug}`} className="text-sm font-semibold text-ink/55 hover:text-ink">
          Full syllabus →
        </Link>
      </div>
      <ol className="mt-4 space-y-3">
        {modules.map((m, i) => {
          const reached = isModuleDone(m, progress);
          const current = i === currentIdx;
          const labs = moduleLabs(m);
          return (
            <li
              key={m.slug}
              className={`rounded-2xl p-5 ${
                current ? "bg-paper ring-2 ring-ink" : reached ? "bg-lime-soft" : "bg-paper/60 ring-1 ring-ink/5"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    reached ? "bg-lime-deep text-paper" : current ? "bg-lime text-onlime" : "bg-cream text-ink/30"
                  }`}
                >
                  {reached ? <Check size={16} strokeWidth={3} /> : current ? <Flag size={15} /> : <Lock size={14} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-ink/45">
                    Module {track.modules.indexOf(m) + 1} · {m.title}
                  </p>
                  <p className={`mt-0.5 font-display text-base font-semibold ${reached || current ? "text-ink" : "text-ink/45"}`}>
                    {m.milestone?.title ?? m.title}
                  </p>
                  {current && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {labs.map((l) => {
                        const d = isLabDone(progress, l.slug);
                        return (
                          <li
                            key={l.slug}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium ${
                              d ? "bg-lime-soft text-lime-deep" : "bg-cream text-ink/60"
                            }`}
                          >
                            {d && <Check size={11} strokeWidth={3} />}
                            {l.title}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
                <span className="shrink-0 text-xs font-medium text-ink/40">
                  {labs.filter((l) => isLabDone(progress, l.slug)).length}/{labs.length}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function SkillMap({ track, progress }: { track: Track; progress: Progress }) {
  return (
    <section id="skills" className="rounded-3xl border border-ink/10 bg-paper p-6 md:p-7">
      <h2 className="font-display text-lg font-semibold text-ink">What you can do</h2>
      <p className="mt-0.5 text-xs text-ink/50">
        Skills you&apos;ve proven by passing a lab&apos;s checks — not lessons you&apos;ve clicked through.
      </p>
      <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {trackLabs(track).flatMap((lab) =>
          lab.skills.map((skill) => {
            const done = isLabDone(progress, lab.slug);
            return (
              <li key={lab.slug + skill} className="flex items-start gap-2.5 text-sm">
                <span
                  className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                    done ? "bg-lime text-onlime" : "border border-ink/15"
                  }`}
                >
                  {done && <Check size={11} strokeWidth={3} />}
                </span>
                <span className={done ? "text-ink" : "text-ink/40"}>{skill}</span>
              </li>
            );
          }),
        )}
      </ul>
    </section>
  );
}
