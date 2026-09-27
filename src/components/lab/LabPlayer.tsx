"use client";

import { useEffect, useState } from "react";
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
    if (status === "ready") preload(lab.packages);
  }, [status, preload, lab.packages]);
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
      window.scrollTo({ top: 0 });
      return;
    }
    setIndex(index + 1);
    window.scrollTo({ top: 0 });
  }

  if (finished) return <LabComplete lab={lab} />;
  if (showOverview) {
    return (
      <LabOverview
        lab={lab}
        done={done}
        onStart={() => {
          setShowOverview(false);
          window.scrollTo({ top: 0 });
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
            {step.kind === "concept" && <ConceptView step={step} />}
            {step.kind === "experiment" && (
              <ExperimentView step={step} done={stepDone} onComplete={complete} />
            )}
            {step.kind === "predict" && (
              <PredictView step={step} done={stepDone} onComplete={complete} python={python} packages={lab.packages} />
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
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <header className="border-b border-ink/10 bg-paper px-6 py-4">
        <Logo />
      </header>
      <main className="flex w-full flex-1 flex-col items-start justify-center px-6 md:px-10 xl:px-16 py-20">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime text-onlime">
          <Lock size={22} />
        </span>
        <h1 className="mt-6 font-display text-3xl font-semibold text-ink">{lab.title} is locked</h1>
        {access.reason === "not-enrolled" ? (
          <>
            <p className="mt-3 text-ink/60">
              {current
                ? `This lab is part of ${access.track.name}. You're enrolled in ${current.name} — one track at a time, so finish it first.`
                : `This lab is part of ${access.track.name}. Enroll in a track to start learning.`}
            </p>
            <Link
              href={current ? "/dashboard" : `/tracks/${access.track.slug}`}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper"
            >
              {current ? `Continue ${current.name}` : `See ${access.track.name}`}
              <ArrowRight size={16} />
            </Link>
          </>
        ) : (
          <>
            <p className="mt-3 text-ink/60">
              Labs build on each other. Finish <span className="font-semibold text-ink">{access.first.title}</span>{" "}
              first — this one uses what you&apos;ll learn there.
            </p>
            <Link
              href={`/labs/${access.first.slug}`}
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper"
            >
              Open {access.first.title}
              <ArrowRight size={16} />
            </Link>
          </>
        )}
        {track && (
          <Link href={`/tracks/${track.slug}`} className="mt-4 text-sm font-medium text-ink/50 hover:text-ink">
            View the {track.name} syllabus
          </Link>
        )}
      </main>
    </div>
  );
}
