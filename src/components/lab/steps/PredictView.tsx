"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Eye, Play, X } from "lucide-react";
import type { PredictStep } from "@/lib/curriculum/types";
import type { PyodideStatus } from "@/hooks/usePyodideWorker";
import RichText from "../RichText";
import PythonCode from "../PythonCode";

export default function PredictView({
  step,
  done,
  onComplete,
  python,
  files,
  packages,
}: {
  step: PredictStep;
  files?: Record<string, string>;
  packages?: string[];
  done: boolean;
  onComplete: () => void;
  python: {
    status: PyodideStatus;
    running: boolean;
    output: string;
    loadingPackages: string | null;
    run: (code: string, files?: Record<string, string>, packages?: string[]) => Promise<{ images?: string[] }>;
  };
}) {
  const [choice, setChoice] = useState<number | null>(done ? step.answer : null);
  const [ran, setRan] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const answered = choice !== null;
  const correct = choice === step.answer;

  function pick(i: number) {
    if (answered) return;
    setChoice(i);
    onComplete();
  }

  async function runIt() {
    setRan(true);
    const result = await python.run(step.code, files, packages);
    setImages(result.images ?? []);
  }

  return (
    <div className="grid w-full gap-10 px-6 md:px-10 xl:px-16 py-12 md:grid-cols-2 md:py-16">
      <div>
        <div className="flex items-center gap-2 text-lime-deep">
          <Eye size={16} />
          <p className="eyebrow">Quick quiz</p>
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
          {step.title}
        </h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
          <RichText text={step.prompt} />
        </p>
        <div className="mt-6">
          <PythonCode code={step.code} lineNumbers />
        </div>
      </div>

      <div className="md:pt-16">
        <p className="eyebrow text-ink/40">Your prediction</p>
        <ul className="mt-3 space-y-2.5">
          {step.options.map((opt, i) => {
            const isChoice = choice === i;
            const isAnswer = i === step.answer;
            const state = !answered
              ? "idle"
              : isAnswer
                ? "answer"
                : isChoice
                  ? "wrong"
                  : "muted";
            return (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => pick(i)}
                  disabled={answered}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-5 py-4 text-left font-mono text-sm transition-colors ${
                    state === "idle"
                      ? "border-ink/10 bg-paper hover:border-ink/40"
                      : state === "answer"
                        ? "border-lime-deep/30 bg-lime-soft text-ink"
                        : state === "wrong"
                          ? "border-danger/30 bg-danger-soft text-ink"
                          : "border-ink/5 bg-white/60 text-ink/35"
                  }`}
                >
                  <span className="whitespace-pre-wrap">{opt}</span>
                  {state === "answer" && <Check size={16} className="shrink-0 text-lime-deep" />}
                  {state === "wrong" && <X size={16} className="shrink-0 text-danger" />}
                </button>
              </li>
            );
          })}
        </ul>

        {answered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
              <p className="font-display text-base font-semibold text-ink">
                {correct ? "You called it." : "Not quite — and that's useful."}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/65">
                <RichText text={step.explanation} />
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl bg-code">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
                <span className="eyebrow text-lime">Check it for real</span>
                <button
                  type="button"
                  onClick={runIt}
                  disabled={python.status !== "ready" || python.running}
                  className="inline-flex items-center gap-1.5 rounded-md bg-lime px-3.5 py-1.5 text-xs font-semibold text-onlime disabled:opacity-30"
                >
                  <Play size={11} fill="currentColor" />
                  {python.loadingPackages !== null ? "Loading libraries…" : python.status === "loading" ? "Loading Python…" : "Run it"}
                </button>
              </div>
              <pre className="min-h-16 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-white/80">
                {ran ? python.output || (python.running ? "Running…" : "") : (
                  <span className="text-white/30">Run the code to see what Python actually prints.</span>
                )}
              </pre>
              {images.map((src, k) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={k} src={`data:image/png;base64,${src}`} alt="Chart from the code" className="mx-4 mb-4 max-w-[calc(100%-2rem)] rounded-xl bg-white" />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
