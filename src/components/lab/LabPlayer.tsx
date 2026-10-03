"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Lock, X } from "lucide-react";
import type { Lab } from "@/lib/curriculum/types";
import { enrolledTrack, labAccess, labLabel, trackOfLab, type LabAccess } from "@/lib/curriculum";
import {
  markLabComplete,
  markStepComplete,
  useProgress,
  type Progress,
} from "@/lib/progress";
import { usePyodideWorker } from "@/hooks/usePyodideWorker";
import Logo from "@/components/landing/Logo";
import StepRail, { stepMeta } from "./StepRail";
import ConceptView from "./steps/ConceptView";
import ExperimentView from "./steps/ExperimentView";
import PredictView from "./steps/PredictView";
import CodeView from "./steps/CodeView";
import ExplainView from "./steps/ExplainView";
import ScenarioView from "./steps/ScenarioView";
import ParsonsView from "./steps/ParsonsView";
import TraceTableView from "./steps/TraceTableView";
import BugView from "./steps/BugView";
import LabComplete from "./LabComplete";
import LabOverview from "./LabOverview";

export default function LabPlayer({ lab }: { lab: Lab }) {
  const progress = useProgress();

  // Progress lives in localStorage, so it's only known after mount.
  if (!progress) {
    return <div className="min-h-screen bg-cream" />;
  }

  const access = labAccess(lab.slug, progress);
  if (!access.open) return <LockedLab lab={lab} access={access} progress={progress} />;

  return <LabSession lab={lab} progress={progress} />;
}

function LabSession({ lab, progress }: { lab: Lab; progress: Progress }) {
  const saved = progress.labs[lab.slug];
  const done = new Set(saved?.steps ?? []);
  const track = trackOfLab(lab.slug, progress);

  // Resume at the first unfinished step.
  const firstOpen = lab.steps.findIndex((s) => !done.has(s.id));
  const [index, setIndex] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [finished, setFinished] = useState(false);
  // Open on the lab's syllabus page unless the learner is mid-lab.
  const [showOverview, setShowOverview] = useState(done.size === 0 || firstOpen === -1);

  const python = usePyodideWorker();
  const { preload, status } = python;
  // Fetch this lab's libraries while the learner reads the first lesson.
  useEffect(() => {
    if (status === "ready") preload(lab.packages, lab.files);
  }, [status, preload, lab.packages, lab.files]);

  // Warm up the code editor in the background once the page is showing.
  useEffect(() => {
    const t = setTimeout(() => void import("./CodeEditor"), 1500);
    return () => clearTimeout(t);
  }, []);
  const step = lab.steps[index];
  const stepDone = done.has(step.id);
  // Concepts are complete as soon as they're read.
  const canContinue = stepDone || step.kind === "concept";
  const reachable = (() => {
    const i = lab.steps.findIndex((s) => !done.has(s.id));
    return i === -1 ? lab.steps.length - 1 : i;
  })();
  const isLast = index === lab.steps.length - 1;
  const meta = stepMeta(step);

  function complete() {
    markStepComplete(lab.slug, step.id);
  }

  function next() {
    if (step.kind === "concept") complete();
    if (isLast) {
      markLabComplete(lab.slug);
      setFinished(true);
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    setIndex(index + 1);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  if (finished) return <LabComplete lab={lab} />;
  if (showOverview) {
    return (
      <LabOverview
        lab={lab}
        done={done}
        onStart={() => {
          setShowOverview(false);
          window.scrollTo({ top: 0, behavior: "instant" });
        }}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper">
        <div className="flex items-center gap-4 px-4 py-2.5 md:px-6">
          <Logo withWordmark={false} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-ink/45">
              {track?.name} · {labLabel(lab, track)}
            </p>
            <p className="truncate font-display text-sm font-semibold text-ink">{lab.title}</p>
          </div>
          <div className="hidden w-[46%] md:block">
            <StepRail steps={lab.steps} current={index} done={done} reachable={reachable} onSelect={setIndex} />
          </div>
          <Link
            href={track ? `/tracks/${track.slug}` : "/dashboard"}
            aria-label="Leave lab"
            className="rounded-lg p-2 text-ink/45 hover:bg-cream hover:text-ink"
          >
            <X size={18} />
          </Link>
        </div>
        <div className="px-4 pb-1 md:hidden">
          <StepRail steps={lab.steps} current={index} done={done} reachable={reachable} onSelect={setIndex} />
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-1 flex-col"
          >
            {step.kind === "concept" && (
              <ConceptView
                step={step}
                runnable={step.run ?? !!lab.runExamples}
                files={lab.files}
                packages={lab.packages}
                python={python}
              />
            )}
            {step.kind === "experiment" && (
              <ExperimentView step={step} done={stepDone} onComplete={complete} files={lab.files} packages={lab.packages} python={python} />
            )}
            {step.kind === "predict" && (
              <PredictView step={step} done={stepDone} onComplete={complete} python={python} files={lab.files} packages={lab.packages} />
            )}
            {step.kind === "code" && (
              <CodeView
                step={step}
                labSlug={lab.slug}
                files={lab.files}
                packages={lab.packages}
                savedCode={saved?.code?.[step.id]}
                done={stepDone}
                onComplete={complete}
                python={python}
              />
            )}
            {step.kind === "explain" && (
              <ExplainView step={step} done={stepDone} onComplete={complete} />
            )}
            {step.kind === "scenario" && (
              <ScenarioView step={step} done={stepDone} onComplete={complete} />
            )}
            {step.kind === "parsons" && (
              <ParsonsView step={step} done={stepDone} onComplete={complete} files={lab.files} packages={lab.packages} python={python} />
            )}
            {step.kind === "trace" && (
              <TraceTableView step={step} done={stepDone} onComplete={complete} files={lab.files} packages={lab.packages} python={python} />
            )}
            {step.kind === "bug" && (
              <BugView step={step} done={stepDone} onComplete={complete} files={lab.files} packages={lab.packages} python={python} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="sticky bottom-0 z-30 border-t border-ink/10 bg-paper">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <button
            type="button"
            onClick={() => setIndex(Math.max(0, index - 1))}
            disabled={index === 0}
            className="inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-semibold text-ink/60 hover:bg-cream hover:text-ink disabled:invisible"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <p className="hidden items-center gap-2 text-xs text-ink/45 sm:flex">
            <meta.icon size={13} />
            Step {index + 1} of {lab.steps.length} · {meta.label}
          </p>
          <div className="flex items-center gap-3">
            {!canContinue && (
              <span className="hidden text-xs text-ink/45 md:inline">
                {step.kind === "code"
                  ? "Pass every check to continue"
                  : step.kind === "experiment"
                    ? "Play with the experiment to continue"
                    : step.kind === "predict"
                      ? "Make a prediction to continue"
                      : step.kind === "scenario"
                        ? "Find the best call to continue"
                        : step.kind === "parsons"
                          ? "Solve the puzzle to continue"
                          : step.kind === "trace"
                            ? "Complete the table to continue"
                            : step.kind === "bug"
                              ? "Find the bug to continue"
                              : "Check your explanation to continue"}
              </span>
            )}
            <button
              type="button"
              onClick={next}
              disabled={!canContinue}
              className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-opacity disabled:opacity-25"
            >
              {isLast ? "Finish lab" : "Continue"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function LockedLab({
  lab,
  access,
  progress,
}: {
  lab: Lab;
  access: Exclude<LabAccess, { open: true }>;
  progress: Progress;
}) {
  const track = trackOfLab(lab.slug, progress);
  const current = enrolledTrack(progress);
  const notEnrolled = access.reason === "not-enrolled";

  return (
    <div className="flex min-h-screen flex-col bg-cream text-ink">
      <header className="flex items-center gap-4 border-b border-ink/10 bg-paper px-6 py-3 md:px-10 xl:px-16">
        <Logo withWordmark={false} />
        {track && (
          <Link href={`/tracks/${track.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-ink">
            <ArrowLeft size={15} />
            {track.name} syllabus
          </Link>
        )}
      </header>

      <main className="w-full flex-1 px-6 py-8 md:px-10 md:py-10 xl:px-16">
        <section className="overflow-hidden rounded-[28px] bg-paper ring-1 ring-ink/10">
          <div className={`relative isolate flex items-end ${lab.cover ? "min-h-[15rem] md:min-h-[19rem]" : ""}`}>
            {lab.cover && (
              <>
                <Image src={lab.cover.src} alt={lab.cover.alt} fill priority sizes="100vw" className="-z-20 object-cover object-[center_40%] grayscale" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/55 to-black/30" />
              </>
            )}
            <div className={`w-full p-7 md:p-10 ${lab.cover ? "text-white" : ""}`}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 text-xs font-semibold text-onlime">
                <Lock size={12} /> Locked
              </span>
              <p className={`eyebrow mt-4 ${lab.cover ? "text-white/70" : "text-ink/50"}`}>
                {labLabel(lab, track)} · {lab.subject}
              </p>
              <h1 className="mt-2 max-w-4xl font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-5xl">{lab.title}</h1>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <section className="rounded-3xl bg-paper p-7 ring-1 ring-ink/10 md:p-8">
            <p className="eyebrow text-lime-deep">{notEnrolled ? "Not in your track" : "One step at a time"}</p>
            <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {notEnrolled
                ? current
                  ? `This lab is part of ${access.track.name}`
                  : `Enroll in ${access.track.name} to open this lab`
                : `Finish ${access.first.title} first`}
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-ink/60">
              {notEnrolled
                ? current
                  ? `You're enrolled in ${current.name}. Nurulabs works one track at a time, so every lab builds on the last. Finish ${current.name}${current.placement ? ", or pass its placement check," : ""} and you can move on to ${access.track.name}.`
                  : `Labs open as you work through a track's syllabus, starting from the first one. The track page shows what you need to enroll.`
                : "Labs build on each other, and this one uses what you'll learn there. It opens as soon as you've finished it."}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {notEnrolled ? (
                <Link
                  href={current ? "/dashboard" : `/tracks/${access.track.slug}`}
                  className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper"
                >
                  {current ? `Continue ${current.name}` : `See ${access.track.name}`}
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link href={`/labs/${access.first.slug}`} className="inline-flex items-center gap-2 rounded-md bg-lime px-6 py-3 text-sm font-semibold text-onlime">
                  Open {access.first.title}
                  <ArrowRight size={16} />
                </Link>
              )}
              {track && (
                <Link href={`/tracks/${track.slug}`} className="inline-flex items-center rounded-md px-6 py-3 text-sm font-semibold text-ink ring-1 ring-ink/15 hover:bg-cream">
                  View the syllabus
                </Link>
              )}
            </div>
          </section>

          <section className="rounded-3xl bg-paper p-7 ring-1 ring-ink/10 md:p-8">
            <p className="eyebrow text-ink/45">What you&apos;ll learn here</p>
            <p className="mt-3 leading-relaxed text-ink/70">{lab.summary}</p>
            <ul className="mt-5 space-y-2.5">
              {lab.skills.map((s) => (
                <li key={s} className="flex items-start gap-3 text-sm text-ink/75">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cream text-ink/40">
                    <Lock size={10} />
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
