"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Flag, Lock } from "lucide-react";
import type { Track } from "@/lib/curriculum/types";
import {
  canWorkOnTrack,
  enrolledTrack,
  isLabDone,
  isModuleDone,
  labAccess,
  labLabel,
  moduleLabs,
  requiredLabs,
  trackLabs,
  trackStats,
} from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import ProgressBar from "@/components/ui/ProgressBar";
import EnrollAction from "./EnrollAction";
import TrackSyllabus from "./TrackSyllabus";
import SectionHeading from "./SectionHeading";
import { plural } from "./format";
import { isModuleLocked } from "./moduleLock";


export default function TrackView({ track }: { track: Track }) {
  const progress = useProgress();
  const stats = trackStats(track, progress);
  const workable = canWorkOnTrack(track, progress);
  const isEnrolled = enrolledTrack(progress)?.slug === track.slug;
  const labs = trackLabs(track);
  const required = requiredLabs(track);
  const activities = required.reduce((s, l) => s + l.steps.length, 0);
  const projects = labs.filter((l) => l.kind === "project");
  const bonusModules = track.modules.filter((m) => m.optional && moduleLabs(m).length);
  const next = workable ? stats.next : undefined;
  const nextStarted = next && progress?.labs[next.slug]?.steps.length;
  const soon = track.status === "coming-soon";
  const plannedCount = track.modules.reduce((n, m) => n + (m.planned?.length ?? 0), 0);
  const currentModule = next && track.modules.find((m) => m.labs.includes(next.slug));

  return (
    <div>
      {/* Hero: the track's photo with its name, then what it takes and how to start */}
      <section className="overflow-hidden rounded-[28px] bg-paper text-ink ring-1 ring-ink/10">
        <div className="relative isolate flex min-h-[18rem] items-end md:min-h-[24rem]">
          {track.cover && (
            <Image src={track.cover.src} alt={track.cover.alt} fill priority sizes="100vw" className="-z-20 object-cover object-[center_35%]" />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full p-7 text-white md:p-10"
          >
            <p className="eyebrow text-lime">
              {isEnrolled ? "Your track" : soon ? "Planned syllabus" : "Track"} · {track.level}
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">{track.name}</h1>
            <p className="mt-3 max-w-2xl text-base text-white/75 md:text-lg">{track.tagline}</p>
          </motion.div>
        </div>

        <div className="grid gap-8 p-7 md:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div>
            <p className="max-w-2xl text-lg leading-relaxed text-ink/70">{track.description}</p>
            {soon && (
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink/55">
                This is the plan for the track. Labs are being written now, and this page fills in as they go live.
              </p>
            )}
            <div className="mt-7">
              {next ? (
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

          <div>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-ink/10 sm:grid-cols-4 lg:grid-cols-2">
              {(soon
                ? [
                    ["Modules planned", String(track.modules.length)],
                    ["Lessons planned", String(plannedCount)],
                  ]
                : [
                    ["Modules", String(track.modules.length - bonusModules.length)],
                    ["Labs", String(stats.total)],
                    ["Projects", String(required.filter((l) => l.kind === "project").length)],
                    ["Activities", String(activities)],
                  ]
              ).map(([label, value]) => (
                <div key={label} className="bg-cream px-5 py-4">
                  <dt className="text-xs font-medium text-ink/50">{label}</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
            {!soon && bonusModules.length > 0 && (
              <p className="mt-3 text-xs text-ink/50">
                Plus an optional bonus module, {bonusModules.map((m) => m.title).join(", ")}, {stats.complete ? "open to you now" : "that opens when you finish"}.
              </p>
            )}
            {workable && (
              <div className="mt-5">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold">
                    {stats.done} of {stats.total} labs done
                  </span>
                  <span className="text-ink/50">{stats.percent}%</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={stats.percent} />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* The journey: every module in order, with where the learner is now */}
      <section className="mt-14">
        <SectionHeading eyebrow="The journey" title={`${track.modules.length - bonusModules.length} modules, one skill at a time${bonusModules.length ? ", plus a bonus" : ""}`} />
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {track.modules.map((mod, i) => {
            const modLabs = moduleLabs(mod);
            const done = modLabs.length > 0 && isModuleDone(mod, progress);
            const current = mod === currentModule;
            const doneCount = modLabs.filter((l) => isLabDone(progress, l.slug)).length;
            const locked = isModuleLocked(mod, progress, workable);
            return (
              <li key={mod.slug}>
                <a
                  href={`#module-${mod.slug}`}
                  className={`group flex h-full flex-col rounded-2xl p-5 transition-colors ${
                    done
                      ? "bg-lime text-onlime shadow-[0_12px_30px_-18px_rgba(85,113,10,0.8)]"
                      : current
                        ? "bg-paper ring-2 ring-lime-deep"
                        : locked
                          ? "bg-ink/[0.03] ring-1 ring-ink/10 hover:ring-ink/20"
                          : "bg-paper ring-1 ring-ink/10 hover:ring-ink/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full font-display text-sm font-semibold ${
                        done ? "bg-onlime text-lime" : current ? "bg-lime text-onlime" : locked ? "bg-ink/5 text-ink/35" : "bg-cream text-ink/55"
                      }`}
                    >
                      {done ? <Check size={16} strokeWidth={3} /> : i + 1}
                    </span>
                    {current && <span className="text-xs font-semibold text-lime-deep">You&apos;re here</span>}
                    {done && <span className="text-xs font-semibold text-onlime/70">Completed</span>}
                    {locked && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-ink/40">
                        <Lock size={13} /> Locked
                      </span>
                    )}
                    {mod.optional && !locked && !done && !current && (
                      <span className="rounded-full bg-sun/15 px-2 py-0.5 text-xs font-semibold text-sun">Bonus</span>
                    )}
                  </div>
                  {mod.optional && (locked || current || done) && (
                    <p className={`mt-3 text-[11px] font-semibold uppercase tracking-wide ${done ? "text-onlime/60" : "text-sun"}`}>Optional bonus</p>
                  )}
                  <p className={`${mod.optional && (locked || current || done) ? "mt-1" : "mt-4"} font-display text-base font-semibold leading-snug ${done ? "" : locked ? "text-ink/45" : "text-ink"}`}>{mod.title}</p>
                  <p className={`mt-1 text-xs ${done ? "text-onlime/65" : "text-ink/50"}`}>
                    {modLabs.length
                      ? `${plural(modLabs.length, "lab")}${workable ? ` · ${doneCount}/${modLabs.length} done` : ""}`
                      : `${mod.planned?.length ?? 0} lessons planned`}
                  </p>
                  {mod.milestone && (
                    <p className={`mt-auto flex items-start gap-1.5 pt-4 text-xs leading-snug ${done ? "font-semibold text-onlime/80" : "text-ink/60"}`}>
                      <Flag size={12} className={`mt-0.5 shrink-0 ${done ? "" : "text-ink/35"}`} />
                      {mod.milestone.title}
                    </p>
                  )}
                </a>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Projects: the real-world work the track builds towards */}
      {projects.length > 0 && (
        <section className="mt-14">
          <SectionHeading
            eyebrow="What you'll build"
            title={projects.length === 1 ? "A project from real local data" : `${projects.length} projects from real local data`}
          />
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((p) => {
              const open = workable && labAccess(p.slug, progress).open;
              const done = isLabDone(progress, p.slug);
              const modIndex = track.modules.findIndex((m) => m.labs.includes(p.slug));
              const body = (
                <>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {p.cover && (
                      <Image
                        src={p.cover.src}
                        alt={p.cover.alt}
                        fill
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="eyebrow text-lime">
                        {track.modules[modIndex]?.optional ? "Bonus project" : labLabel(p, track)} · Module {modIndex + 1}
                      </p>
                      <p className="mt-1 font-display text-xl font-semibold leading-snug">{p.title}</p>
                    </div>
                    {done && (
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-lime px-2.5 py-1 text-xs font-semibold text-onlime">
                        <Check size={12} strokeWidth={3} /> Built
                      </span>
                    )}
                  </div>
                  <p className="p-5 text-sm leading-relaxed text-ink/65">{p.summary}</p>
                </>
              );
              return (
                <li key={p.slug} className="group overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/10">
                  {open ? (
                    <Link href={`/labs/${p.slug}`} className="block">
                      {body}
                    </Link>
                  ) : (
                    <a href={`#module-${track.modules[modIndex]?.slug}`} className="block">
                      {body}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <TrackSyllabus track={track} progress={progress} workable={workable} nextSlug={next?.slug} />
    </div>
  );
}
