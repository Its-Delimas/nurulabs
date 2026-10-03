"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Bug, Footprints, Loader2, Play } from "lucide-react";
import type { BugStep } from "@/lib/curriculum/types";
import type { PythonWorker, RunResult } from "@/hooks/usePyodideWorker";
import RichText from "../RichText";
import PythonCode from "../PythonCode";

const CodeVisualiser = dynamic(() => import("../visualiser/CodeVisualiser"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-ink/5" />,
});

/** Find the bug: run the program if you like, then click the line that's wrong. */
export default function BugView({
  step,
  done,
  onComplete,
  files,
  packages,
  python,
}: {
  step: BugStep;
  done: boolean;
  onComplete: () => void;
  /** The lab's files and packages, so the code can open and import them. */
  files?: Record<string, string>;
  packages?: string[];
  python: Pick<PythonWorker, "status" | "run" | "trace">;
}) {
  const [picked, setPicked] = useState<number[]>(done ? [step.line] : []);
  const [run, setRun] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [stepping, setStepping] = useState(false);
  const found = picked.includes(step.line);
  const last = picked[picked.length - 1];
  const misses = picked.filter((l) => l !== step.line).length;
  const lines = step.code.replace(/\n$/, "").split("\n");

  function pick(line: number) {
    if (found || picked.includes(line)) return;
    setPicked((p) => [...p, line]);
    if (line === step.line) onComplete();
  }

  async function runIt() {
    setRunning(true);
    setRun(await python.run(step.code, files, packages));
    setRunning(false);
  }

  return (
    <div className="grid w-full gap-10 px-6 py-12 md:px-10 md:py-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:px-16">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-lime-deep">
          <Bug size={16} />
          <p className="eyebrow">Find the bug</p>
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">{step.title}</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
          <RichText text={step.prompt} />
        </p>
        <p className="mt-3 text-sm text-ink/50">Run it to see what it really does, or step through it line by line, then click the line with the bug.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runIt}
            disabled={running || python.status !== "ready"}
            className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-40"
          >
            {running ? <Loader2 size={15} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
            {python.status !== "ready" ? "Loading Python…" : "Run it"}
          </button>
          <button
            type="button"
            onClick={() => setStepping((s) => !s)}
            className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold text-ink/70 ring-1 ring-ink/15 hover:text-ink"
          >
            <Footprints size={15} /> {stepping ? "Hide the steps" : "Step through it"}
          </button>
        </div>
        {run && (
          <div className="mt-4 rounded-2xl bg-code px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-lime">Output</p>
            <pre className="mt-1.5 whitespace-pre-wrap font-mono text-xs text-white/85">{run.stdout || (run.error ? "" : "(nothing printed)")}</pre>
            {run.error && <p className="mt-1 font-mono text-xs text-[#ff9b9b]">{run.error.summary}</p>}
          </div>
        )}
      </div>

      <div className="min-w-0">
        <ol aria-label="The program's lines" className="overflow-hidden rounded-2xl bg-code py-3">
          {lines.map((text, i) => {
            const n = i + 1;
            const state = picked.includes(n) ? (n === step.line ? "bug" : "fine") : found ? "idle-done" : "idle";
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pick(n)}
                  disabled={found || picked.includes(n) || text.trim() === ""}
                  className={`flex w-full items-start gap-3 px-4 py-1 text-left font-mono text-[13px] leading-relaxed transition-colors ${
                    state === "bug"
                      ? "bg-danger/30 text-white"
                      : state === "fine"
                        ? "bg-white/5 text-white/40 line-through decoration-white/20"
                        : state === "idle"
                          ? "text-white/85 hover:bg-lime/15"
                          : "text-white/60"
                  }`}
                >
                  <span className="w-5 shrink-0 select-none text-right text-white/30">{n}</span>
                  <span className="whitespace-pre">{text || " "}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {!found && last !== undefined && (
          <p className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm text-ink/75">
            <RichText text={step.wrong?.[last] ?? `Line ${last} does what it should. Look again at what the program prints, and what it was meant to print.`} />
          </p>
        )}
        {!found && misses >= 3 && (
          <button type="button" onClick={() => pick(step.line)} className="mt-3 text-sm font-semibold text-ink/60 underline underline-offset-4 hover:text-ink">
            Show me the bug
          </button>
        )}

        <AnimatePresence>
          {found && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl bg-lime-soft p-5 ring-1 ring-lime-deep/20">
              <p className="eyebrow text-lime-deep">The bug is on line {step.line}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/80">
                <RichText text={step.explanation} />
              </p>
              {step.fix && (
                <div className="mt-3 space-y-1">
                  <PythonCode code={`- ${lines[step.line - 1].trim()}`} className="py-2 text-[12px] opacity-70" />
                  <PythonCode code={`+ ${step.fix.trim()}`} className="py-2 text-[12px]" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {stepping && (
        <div className="rounded-[28px] bg-paper p-5 ring-1 ring-ink/10 md:p-8 lg:col-span-2">
          <CodeVisualiser code={step.code} editable={false} files={files} packages={packages} python={python} />
        </div>
      )}
    </div>
  );
}
