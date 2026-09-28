"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  CircleDashed,
  Code2,
  Eye,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import type { CodeStep } from "@/lib/curriculum/types";
import type { PyodideStatus, RunResult } from "@/hooks/usePyodideWorker";
import { mentorFor, type Attempt } from "@/lib/mentor";
import { recordActivityToday, saveCode } from "@/lib/progress";
// The editor (CodeMirror) is the heaviest part of a lab page; load it only when a code step needs it.
const CodeEditor = dynamic(() => import("../CodeEditor"), {
  ssr: false,
  loading: () => <div className="min-h-64 bg-code" />,
});
import ErrorExplainer from "../ErrorExplainer";
import RichText from "../RichText";
import PythonCode from "../PythonCode";

export interface PythonApi {
  status: PyodideStatus;
  running: boolean;
  output: string;
  loadingPackages: string | null;
  run: (code: string, files?: Record<string, string>, packages?: string[]) => Promise<RunResult>;
  check: (exprs: string[]) => Promise<boolean[]>;
}

export default function CodeView({
  step,
  labSlug,
  files,
  packages,
  savedCode,
  done,
  onComplete,
  python,
}: {
  step: CodeStep;
  labSlug: string;
  files?: Record<string, string>;
  packages?: string[];
  savedCode?: string;
  done: boolean;
  onComplete: () => void;
  python: PythonApi;
}) {
  const [code, setCode] = useState(savedCode ?? step.starterCode);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [results, setResults] = useState<boolean[] | null>(null);
  const [lastRun, setLastRun] = useState<RunResult | null>(null);
  const [ranCode, setRanCode] = useState("");
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  const mentor = useMemo(() => mentorFor(step, attempts, ranCode), [step, attempts, ranCode]);
  const failures = attempts.filter((a) => a.kind !== "success").length;
  const solved = attempts[attempts.length - 1]?.kind === "success";

  async function handleRun() {
    saveCode(labSlug, step.id, code);
    setRanCode(code);
    const result = await python.run(code, files, packages);
    setLastRun(result);
    if (!result.ok && result.error) {
      setResults(null);
      setAttempts((a) => [...a, { kind: "error", error: result.error! }]);
      return;
    }
    recordActivityToday();
    const passed = await python.check(step.checks.map((c) => c.expr));
    setResults(passed);
    const failed = passed.flatMap((ok, i) => (ok ? [] : [i]));
    if (failed.length === 0) {
      setAttempts((a) => [...a, { kind: "success" }]);
      onComplete();
    } else {
      setAttempts((a) => [...a, { kind: "checks", failed }]);
    }
  }

  function handleReset() {
    setCode(step.starterCode);
    saveCode(labSlug, step.id, step.starterCode);
  }

  const KindIcon = step.challenge ? Target : Code2;

  return (
    <div className="grid w-full min-w-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
      {/* Brief, checks, mentor */}
      <aside className="min-w-0 border-b border-ink/10 bg-paper px-6 py-8 lg:border-r lg:border-b-0">
        <div className="flex items-center gap-2 text-lime-deep">
          <KindIcon size={15} />
          <p className="eyebrow">{step.challenge ? "Challenge" : "Practice"}</p>
        </div>
        <h1 className="mt-2 font-display text-2xl font-semibold leading-tight text-ink">
          {step.title}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink/70">
          <RichText text={step.brief} />
        </p>

        {step.instructions && (
          <ol className="mt-5 space-y-2.5">
            {step.instructions.map((ins, i) => (
              <li key={ins} className="flex gap-3 text-sm leading-relaxed text-ink/75">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cream font-mono text-[11px] font-semibold text-ink/60">
                  {i + 1}
                </span>
                <span>
                  <RichText text={ins} />
                </span>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-7">
          <p className="eyebrow text-ink/40">Checks</p>
          <ul className="mt-3 space-y-2">
            {step.checks.map((c, i) => {
              const state = results ? (results[i] ? "pass" : "fail") : done ? "pass" : "pending";
              return (
                <li key={c.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      state === "pass"
                        ? "bg-lime text-onlime"
                        : state === "fail"
                          ? "bg-danger-soft text-danger"
                          : "text-ink/25"
                    }`}
                  >
                    {state === "pass" ? (
                      <Check size={12} strokeWidth={3} />
                    ) : state === "fail" ? (
                      <X size={12} strokeWidth={3} />
                    ) : (
                      <CircleDashed size={18} />
                    )}
                  </span>
                  <span className={state === "pending" ? "text-ink/45" : "text-ink/85"}>
                    <RichText text={c.label} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Mentor */}
        <AnimatePresence mode="wait">
          <motion.div
            key={attempts.length}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`mt-7 rounded-2xl p-5 ${
              mentor.tone === "success" ? "bg-lime-soft ring-1 ring-lime-deep/15" : "bg-cream"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {mentor.tone === "success" ? (
                  <Sparkles size={15} className="text-lime-deep" />
                ) : (
                  <Bot size={15} className="text-lime-deep" />
                )}
                <p className="eyebrow text-lime-deep">
                  {mentor.tone === "success" ? "Why it works" : "Mentor"}
                </p>
              </div>
              {mentor.reason && (
                <span className="text-[11px] font-medium text-ink/40">{mentor.reason}</span>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/80">
              <RichText text={mentor.body} />
            </p>
            {solved && step.tryNext && (
              <p className="mt-3 border-t border-lime-deep/15 pt-3 text-sm leading-relaxed text-ink/70">
                <span className="font-semibold text-ink">Keep poking: </span>
                <RichText text={step.tryNext} />
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {!solved && step.hints.length > 0 && (
          <div className="mt-4 space-y-2">
            {step.hints.slice(0, hintsShown).map((h, i) => (
              <p key={h} className="rounded-xl border border-ink/10 p-3.5 text-sm leading-relaxed text-ink/70">
                <span className="mr-1.5 font-semibold text-ink">Hint {i + 1}.</span>
                <RichText text={h} />
              </p>
            ))}
            <div className="flex flex-wrap gap-2">
              {hintsShown < step.hints.length && (
                <button
                  type="button"
                  onClick={() => setHintsShown((n) => n + 1)}
                  className="rounded-md border border-ink/15 px-3.5 py-2 text-xs font-semibold text-ink hover:border-ink"
                >
                  {hintsShown === 0 ? "Get a hint" : "Another hint"}
                </button>
              )}
              {step.solution && failures >= 4 && (
                <button
                  type="button"
                  onClick={() => setShowSolution((s) => !s)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 px-3.5 py-2 text-xs font-semibold text-ink hover:border-ink"
                >
                  <Eye size={13} />
                  {showSolution ? "Hide" : "Compare with"} a working solution
                </button>
              )}
            </div>
            {showSolution && step.solution && (
              <div>
                <p className="mb-2 text-xs text-ink/50">
                  Don&apos;t copy it — find the one line that differs from yours.
                </p>
                <PythonCode code={step.solution} className="text-[12px]" />
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Editor + output */}
      <div className="flex min-h-[560px] min-w-0 flex-col bg-cream p-4 lg:sticky lg:top-[57px] lg:self-start lg:h-[calc(100vh-57px-65px)] lg:p-6">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-code ring-1 ring-ink/10 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.55)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-white/50">main.py</span>
              {files &&
                Object.keys(files).map((f) => (
                  <span key={f} className="rounded bg-white/5 px-2 py-0.5 font-mono text-[11px] text-white/35">
                    {f}
                  </span>
                ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                title="Reset to starter code"
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-white/45 hover:bg-white/5 hover:text-white"
              >
                <RotateCcw size={12} />
                Reset
              </button>
              <button
                type="button"
                onClick={handleRun}
                disabled={python.status !== "ready" || python.running}
                className="inline-flex items-center gap-1.5 rounded-md bg-lime px-4 py-1.5 text-xs font-semibold text-onlime transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <Play size={11} fill="currentColor" />
                {python.loadingPackages !== null
                  ? "Loading libraries…"
                  : python.running
                    ? "Running…"
                    : python.status === "loading"
                      ? "Loading Python…"
                      : "Run"}
              </button>
            </div>
          </div>

          <div className="min-h-[260px] flex-1 overflow-hidden">
            <CodeEditor value={code} onChange={setCode} />
          </div>

          <div className={`${lastRun?.images?.length ? "h-[60%]" : "h-[40%]"} min-h-40 overflow-y-auto border-t border-white/10`}>
            <div className="sticky top-0 flex items-center justify-between bg-code px-4 py-2">
              <span className="eyebrow text-lime">Output</span>
              {python.status === "error" && (
                <span className="text-xs text-red-300">
                  Couldn&apos;t load Python. Reload the page.
                </span>
              )}
            </div>
            <div className="px-4 pb-4">
              <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-white/80">
                {python.running && !python.output && "Running…"}
                {lastRun || python.running ? python.output : (
                  <span className="text-white/30">Press Run to execute your code.</span>
                )}
              </pre>
              {python.loadingPackages && (
                <p className="mt-2 font-mono text-xs text-white/45">
                  Downloading {python.loadingPackages} — only the first time, then it&apos;s cached.
                </p>
              )}
              {!python.running && lastRun?.images && lastRun.images.length > 0 && (
                <div className="mt-3 space-y-3">
                  {lastRun.images.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={`data:image/png;base64,${src}`} alt={`Chart ${i + 1} from your code`} className="max-w-full rounded-xl bg-white" />
                  ))}
                </div>
              )}
              {!python.running && lastRun && !lastRun.ok && lastRun.error && (
                <div className="mt-3">
                  <ErrorExplainer error={lastRun.error} code={ranCode} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
