"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, ClipboardCheck, RotateCcw, X } from "lucide-react";
import type { Track } from "@/lib/curriculum/types";
import { getLab, labNumber, passedPlacement, tracksUnlockedBy } from "@/lib/curriculum";
import { recordPlacement, useProgress } from "@/lib/progress";
import PythonCode from "@/components/lab/PythonCode";
import RichText from "@/components/lab/RichText";
import ProgressBar from "@/components/ui/ProgressBar";
import EnrollAction from "./EnrollAction";

const PASS_RATIO = 0.8;

/** Deterministic shuffle so option order is stable across renders but the answer isn't always first. */
function order(n: number, seed: number) {
  const idx = Array.from({ length: n }, (_, i) => i);
  let s = seed + 7;
  for (let i = n - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = s % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export default function PlacementCheck({ track }: { track: Track }) {
  const progress = useProgress();
  const questions = useMemo(() => track.placement ?? [], [track]);
  const orders = useMemo(() => questions.map((q, i) => order(q.options.length, i)), [questions]);
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const needed = Math.ceil(questions.length * PASS_RATIO);
  const score = answers.filter((a, i) => a === questions[i].answer).length;
  const passed = score >= needed;
  const unlocks = tracksUnlockedBy(track).filter((t) => t.status === "active");

  function answer(option: number) {
    const next = [...answers, option];
    setAnswers(next);
    if (next.length === questions.length) {
      const nextScore = next.filter((a, i) => a === questions[i].answer).length;
      if (nextScore >= needed) recordPlacement(track.slug);
      setPhase("result");
    } else {
      setCurrent(current + 1);
    }
  }

  function restart() {
    setAnswers([]);
    setCurrent(0);
    setPhase("quiz");
  }

  if (phase === "intro") {
    const already = passedPlacement(track, progress);
    return (
      <div className="max-w-3xl py-6">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime text-onlime">
          <ClipboardCheck size={22} />
        </span>
        <p className="eyebrow mt-6 text-lime-deep">Placement check</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
          Already know {track.shortName}?
        </h1>
        <p className="mt-4 leading-relaxed text-ink/65">
          If you&apos;ve written {track.shortName} before, you don&apos;t have to sit through {track.name}.
          Answer {questions.length} questions covering the whole track — get {needed} right and you can enroll
          straight into {unlocks.map((t) => t.name).join(" or ") || "the next track"}.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-ink/60">
          <li>• Mostly &ldquo;what does this code print?&rdquo; — read carefully, there&apos;s no time limit.</li>
          <li>• It doesn&apos;t mark any labs complete. You can still open {track.name} any time later.</li>
          <li>• Wrong answers point you to the exact lab that covers them.</li>
        </ul>
        {already && (
          <p className="mt-6 inline-flex items-center gap-2 rounded-xl bg-lime-soft px-4 py-2.5 text-sm font-semibold text-lime-deep">
            <Check size={15} /> You&apos;ve already passed this check.
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setPhase("quiz")}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper"
          >
            Start the check
            <ArrowRight size={16} />
          </button>
          <Link href="/tracks" className="text-sm font-semibold text-ink/55 hover:text-ink">
            Back to tracks
          </Link>
        </div>
      </div>
    );
  }

  if (phase === "quiz") {
    const q = questions[current];
    return (
      <div className="max-w-3xl py-6">
        <div className="flex items-center justify-between text-sm text-ink/50">
          <span>
            Question {current + 1} of {questions.length}
          </span>
          <span>Placement · {track.name}</span>
        </div>
        <div className="mt-3">
          <ProgressBar value={(current / questions.length) * 100} />
        </div>
        <motion.div key={current} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="mt-10">
          <h1 className="font-display text-2xl font-semibold text-ink">
            <RichText text={q.prompt} />
          </h1>
          {q.code && <PythonCode code={q.code} lineNumbers className="mt-5" />}
          <ul className="mt-6 space-y-2.5">
            {orders[current].map((oi) => (
              <li key={oi}>
                <button
                  type="button"
                  onClick={() => answer(oi)}
                  className="w-full rounded-2xl border border-ink/10 bg-paper px-5 py-4 text-left font-mono text-sm whitespace-pre-wrap text-ink transition-colors hover:border-ink/50"
                >
                  {q.options[oi]}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    );
  }

  const unlockedTrack = unlocks[0];
  return (
    <div className="max-w-3xl py-6">
      <p className="eyebrow text-lime-deep">Placement result</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink">
        {score} / {questions.length} — {passed ? "you've placed out." : "not quite yet."}
      </h1>
      <p className="mt-3 leading-relaxed text-ink/65">
        {passed
          ? `You clearly know your way around ${track.shortName}. ${unlockedTrack ? `${unlockedTrack.name} is now open to you.` : ""}`
          : `You needed ${needed}. The questions you missed are listed below with the lab that teaches each one — ${track.name} will get you there properly.`}
      </p>

      {passed && unlockedTrack && (
        <div className="mt-6">
          <EnrollAction track={unlockedTrack} progress={progress} />
        </div>
      )}

      <ol className="mt-10 space-y-2">
        {questions.map((q, i) => {
          const ok = answers[i] === q.answer;
          const lab = getLab(q.lab);
          return (
            <li key={i} className="flex items-start gap-3 rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  ok ? "bg-lime text-onlime" : "bg-danger-soft text-danger"
                }`}
              >
                {ok ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
              </span>
              <div className="min-w-0 text-sm">
                <p className="text-ink/80">
                  Q{i + 1}. <RichText text={q.prompt} />
                </p>
                {!ok && (
                  <p className="mt-1 text-ink/55">
                    Answer: <code className="font-mono whitespace-pre-wrap text-ink">{q.options[q.answer]}</code>
                    {lab && <> · covered in Lab {labNumber(lab.slug, track)}: {lab.title}</>}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        {!passed && (
          <Link
            href={`/tracks/${track.slug}`}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper"
          >
            See the {track.name} syllabus
            <ArrowRight size={16} />
          </Link>
        )}
        <button type="button" onClick={restart} className="inline-flex items-center gap-2 text-sm font-semibold text-ink/55 hover:text-ink">
          <RotateCcw size={14} /> Retake
        </button>
      </div>
    </div>
  );
}
