"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock, Flag, Scale, Lock, Target } from "lucide-react";
import type { Lab } from "@/lib/curriculum/types";
import { isLabDone, labAccess, labLabel, moduleLabs, moduleOfLab, nextLabAfter, trackOfLab } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import Logo from "@/components/landing/Logo";
import { stepMeta, stepTone, stepTones } from "./StepRail";

const nouns: Record<string, [string, string]> = {
  Lesson: ["lesson", "lessons"],
  Interactive: ["interactive", "interactives"],
  Quiz: ["quiz", "quizzes"],
  Practice: ["coding exercise", "coding exercises"],
  Challenge: ["challenge", "challenges"],
  Reflect: ["reflection", "reflections"],
  Scenario: ["scenario", "scenarios"],
  Puzzle: ["code puzzle", "code puzzles"],
  Trace: ["trace table", "trace tables"],
  "Find the bug": ["bug hunt", "bug hunts"],
};

const rise = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } };

/** The page before a lab starts: what it teaches, how it runs, and where it sits in the track. */
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
  const siblings = mod ? moduleLabs(mod.module) : [];
  const next = nextLabAfter(lab.slug, progress);
  const started = done.size > 0;
  const finished = done.size === lab.steps.length;
  const isProject = lab.kind === "project";
  const thinking = lab.format === "thinking";
  const label = track ? labLabel(lab, track) : `Lab ${lab.number}`;

  // How many of each kind of activity, in the order they first appear.
  const mix = new Map<string, number>();
  for (const s of lab.steps) mix.set(stepMeta(s).label, (mix.get(stepMeta(s).label) ?? 0) + 1);

  const startButton = (
    <button
      type="button"
      onClick={onStart}
      className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-lime px-6 py-3.5 text-sm font-semibold text-onlime"
    >
      {finished ? "Review lab" : started ? `Resume: ${done.size} of ${lab.steps.length} done` : isProject ? "Start project" : "Start lab"}
      <ArrowRight size={16} />
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="flex items-center gap-4 border-b border-ink/10 bg-paper px-6 py-3 md:px-10 xl:px-16">
        <Logo withWordmark={false} />
        {track && (
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm text-ink/50">
            <Link href={`/tracks/${track.slug}`} className="inline-flex shrink-0 items-center gap-1.5 font-medium hover:text-ink">
              <ArrowLeft size={15} className="sm:hidden" />
              {track.name}
            </Link>
            {mod && (
              <>
                <ChevronRight size={14} className="hidden shrink-0 text-ink/30 sm:block" />
                <Link href={`/tracks/${track.slug}#module-${mod.module.slug}`} className="hidden truncate hover:text-ink sm:block">
                  Module {mod.index + 1}: {mod.module.title}
                </Link>
              </>
            )}
          </nav>
        )}
      </header>

      <main className="w-full flex-1 px-6 py-8 md:px-10 md:py-10 xl:px-16">
        {/* Hero */}
        <motion.section {...rise} className="overflow-hidden rounded-[28px] bg-paper ring-1 ring-ink/10">
          <div className={`relative isolate flex items-end ${lab.cover ? "min-h-[17rem] md:min-h-[22rem]" : ""}`}>
            {lab.cover && (
              <>
                <Image src={lab.cover.src} alt={lab.cover.alt} fill priority sizes="100vw" className="-z-20 object-cover object-[center_40%]" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/40 to-black/5" />
              </>
            )}
            <div className={`w-full p-7 md:p-10 ${lab.cover ? "text-white" : "text-ink"}`}>
              <p className={`eyebrow ${lab.cover ? "text-lime" : "text-lime-deep"}`}>
                {label} · {lab.subject}
              </p>
              <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">{lab.title}</h1>
              <div className={`mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm ${lab.cover ? "text-white/75" : "text-ink/55"}`}>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={15} /> About {lab.minutes} minutes
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Target size={15} /> {lab.steps.length} activities
                </span>
                {thinking && (
                  <span className="inline-flex items-center gap-1.5">
                    <Scale size={15} /> Thinking lab: judgement calls, light on code
                  </span>
                )}
                {isProject && (
                  <span className="inline-flex items-center gap-1.5">
                    <Flag size={15} /> Capstone project
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-14">
            <motion.section {...rise} transition={{ delay: 0.05 }}>
              <p className="max-w-3xl text-xl leading-relaxed text-ink/75">{lab.summary}</p>
              <div className="mt-6 lg:hidden">{startButton}</div>
            </motion.section>

            {/* Outcomes */}
            <section>
              <p className="eyebrow text-lime-deep">By the end</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">What you&apos;ll be able to do</h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {lab.skills.map((s, i) => (
                  <li key={s} className="rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
                    <span className="font-display text-3xl font-semibold leading-none text-lime-deep/40">{String(i + 1).padStart(2, "0")}</span>
                    <p className="mt-3 text-[15px] font-medium leading-snug text-ink">{s}</p>
                  </li>
                ))}
              </ul>
            </section>

            {/* Outline as a path */}
            <section>
              <p className="eyebrow text-lime-deep">How it runs</p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">
                {lab.steps.length} activities, {thinking ? "from idea to a decision you can defend" : "from idea to working code"}
              </h2>
              <p className="mt-2 text-sm text-ink/55">
                {[...mix].map(([k, n]) => `${n} ${nouns[k][n === 1 ? 0 : 1]}`).join(" · ")}
              </p>
              <ol className="relative mt-6">
                {lab.steps.map((step, i) => {
                  const meta = stepMeta(step);
                  const isDone = done.has(step.id);
                  const last = i === lab.steps.length - 1;
                  return (
                    <li key={step.id} className="relative flex gap-4 pb-3">
                      {!last && <span className="absolute left-[19px] top-10 bottom-0 w-px bg-ink/10" aria-hidden />}
                      <span
                        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-cream ${
                          isDone ? "bg-lime text-onlime" : "bg-paper text-ink/60 ring-offset-0"
                        }`}
                      >
                        {isDone ? <Check size={16} strokeWidth={3} /> : <meta.icon size={16} />}
                        {!isDone && <span className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full ring-2 ring-cream ${stepTone(step)}`} />}
                      </span>
                      <div className="min-w-0 flex-1 rounded-2xl bg-paper px-5 py-3.5 ring-1 ring-ink/10">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/45">
                          {i + 1}. {meta.label}
                          {isDone && <span className="ml-2 normal-case tracking-normal text-lime-deep">done</span>}
                        </p>
                        <p className="mt-0.5 font-medium text-ink">{step.title}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* The rest of the module */}
            {mod && track && siblings.length > 1 && (
              <section>
                <p className="eyebrow text-lime-deep">Module {mod.index + 1}</p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">{mod.module.title}</h2>
                <p className="mt-1 max-w-2xl text-ink/60">{mod.module.summary}</p>
                <ol className="mt-6 grid gap-3 sm:grid-cols-2">
                  {siblings.map((l) => {
                    const here = l.slug === lab.slug;
                    const lDone = isLabDone(progress, l.slug);
                    const open = labAccess(l.slug, progress).open;
                    const body = (
                      <>
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                            lDone ? "bg-lime-deep text-paper" : here ? "bg-lime text-onlime" : "bg-cream text-ink/50"
                          }`}
                        >
                          {lDone ? <Check size={14} strokeWidth={3} /> : !open ? <Lock size={13} /> : l.kind === "project" ? <Flag size={14} /> : l.number}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-xs text-ink/45">{here ? "You're looking at this lab" : labLabel(l, track)}</span>
                          <span className="block truncate font-display font-semibold text-ink">{l.title}</span>
                        </span>
                      </>
                    );
                    const cls = `flex items-center gap-3 rounded-2xl p-4 ${here ? "bg-paper ring-2 ring-lime-deep" : "bg-paper ring-1 ring-ink/10"}`;
                    return (
                      <li key={l.slug}>
                        {open && !here ? (
                          <Link href={`/labs/${l.slug}`} className={`${cls} transition-colors hover:ring-ink/25`}>
                            {body}
                          </Link>
                        ) : (
                          <div className={cls}>{body}</div>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </section>
            )}
          </div>

          {/* Start panel */}
          <motion.aside {...rise} transition={{ delay: 0.1 }} className="space-y-4 lg:sticky lg:top-8 lg:self-start">
            <div className="rounded-3xl bg-paper p-6 ring-1 ring-ink/10">
              <div className="flex items-center gap-4">
                <Ring done={done.size} total={lab.steps.length} />
                <div>
                  <p className="font-display text-lg font-semibold text-ink">
                    {finished ? "Lab complete" : started ? "In progress" : "Ready when you are"}
                  </p>
                  <p className="text-sm text-ink/55">
                    {done.size} of {lab.steps.length} activities done
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-1" aria-hidden>
                {lab.steps.map((s) => (
                  <span key={s.id} className={`h-2 flex-1 rounded-full ${stepTone(s)} ${done.has(s.id) ? "" : "opacity-35"}`} />
                ))}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/50">
                {[...mix.keys()].map((k) => (
                  <li key={k} className="inline-flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${stepTones[k as keyof typeof stepTones]}`} />
                    {k}
                  </li>
                ))}
              </ul>

              <p className="mt-6 text-sm leading-relaxed text-ink/60">
                {thinking
                  ? "A thinking lab. The skill here is judgement, so most activities are real situations where you weigh the evidence and make a call, with feedback on every choice. There's still a little Python where it helps."
                  : isProject
                  ? "You get a brief from a real client and a messy dataset. Work through it one stage at a time in real Python, then write up what you found for them."
                  : "Short lessons first, then hands-on activities that build intuition. After that you write and run real Python, and finish by explaining what you learned in your own words."}
              </p>
              <div className="mt-6">{startButton}</div>
            </div>

            {mod?.module.milestone && (
              <div className="flex gap-3 rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime-soft text-lime-deep">
                  <Flag size={16} />
                </span>
                <div>
                  <p className="text-xs font-semibold text-ink/45">Counts toward milestone {mod.index + 1}</p>
                  <p className="mt-0.5 font-display font-semibold text-ink">{mod.module.milestone.title}</p>
                  <p className="mt-1 text-sm text-ink/55">{mod.module.milestone.description}</p>
                </div>
              </div>
            )}

            {next && track && (
              <div className="rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
                <p className="text-xs font-semibold text-ink/45">After this: {labLabel(next, track)}</p>
                <p className="mt-0.5 font-display font-semibold text-ink">{next.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-ink/55">{next.summary}</p>
              </div>
            )}
          </motion.aside>
        </div>
      </main>
    </div>
  );
}

function Ring({ done, total }: { done: number; total: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const frac = total ? done / total : 0;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90" aria-hidden>
        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="5" className="stroke-ink/10" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          className="stroke-lime-deep transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-semibold text-ink">
        {Math.round(frac * 100)}%
      </span>
    </div>
  );
}
