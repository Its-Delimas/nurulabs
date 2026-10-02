"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, CircleDashed, Loader2, Play, Plus, Puzzle, RotateCcw, X } from "lucide-react";
import type { ParsonsStep } from "@/lib/curriculum/types";
import type { PythonWorker, RunResult } from "@/hooks/usePyodideWorker";
import RichText from "../RichText";
import PythonCode from "../PythonCode";

interface Piece {
  id: number;
  text: string;
  /** Indent level in the reference solution (distractors: 0). */
  indent: number;
}

interface Placed {
  id: number;
  indent: number;
}

const INDENT = "    ";

/** A stable shuffle, seeded by the step id, so the order doesn't jump around between visits. */
function shuffle<T>(items: T[], seed: string): T[] {
  let s = [...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function ParsonsView({
  step,
  done,
  onComplete,
  python,
}: {
  step: ParsonsStep;
  done: boolean;
  onComplete: () => void;
  python: Pick<PythonWorker, "status" | "run" | "check">;
}) {
  const pieces = useMemo<Piece[]>(() => {
    const solution = step.lines.map((line, id) => {
      const spaces = line.length - line.trimStart().length;
      return { id, text: line.trim(), indent: Math.round(spaces / 4) };
    });
    const extra = (step.distractors ?? []).map((line, i) => ({ id: step.lines.length + i, text: line.trim(), indent: 0 }));
    return [...solution, ...extra];
  }, [step]);
  const startPool = useMemo(() => shuffle(pieces.map((p) => p.id), step.id), [pieces, step.id]);

  const [program, setProgram] = useState<Placed[]>(() =>
    done ? step.lines.map((_, id) => ({ id, indent: pieces[id].indent })) : [],
  );
  const [results, setResults] = useState<boolean[] | null>(done ? step.checks.map(() => true) : null);
  const [lastRun, setLastRun] = useState<RunResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [misses, setMisses] = useState(0);
  const [solved, setSolved] = useState(done);

  const pool = startPool.filter((id) => !program.some((p) => p.id === id));
  const byId = (id: number) => pieces.find((p) => p.id === id)!;
  const code = program.map((p) => INDENT.repeat(p.indent) + byId(p.id).text).join("\n");

  function add(id: number) {
    setProgram((prog) => {
      const prev = prog[prog.length - 1];
      const piece = byId(id);
      const indent = step.keepIndent
        ? piece.indent
        : prev
          ? prev.indent + (byId(prev.id).text.endsWith(":") ? 1 : 0)
          : 0;
      return [...prog, { id, indent }];
    });
    setResults(null);
  }

  function edit(change: (prog: Placed[]) => Placed[]) {
    setProgram((prog) => change([...prog]));
    setResults(null);
  }
  const indentBy = (i: number, d: number) =>
    edit((prog) => prog.map((p, k) => (k === i ? { ...p, indent: Math.max(0, Math.min(4, p.indent + d)) } : p)));
  const swap = (i: number, j: number) =>
    edit((prog) => {
      [prog[i], prog[j]] = [prog[j], prog[i]];
      return prog;
    });
  const remove = (i: number) => edit((prog) => prog.filter((_, k) => k !== i));

  async function check() {
    setChecking(true);
    const run = await python.run(code);
    setLastRun(run);
    if (!run.ok) {
      setResults(null);
      setMisses((m) => m + 1);
      setChecking(false);
      return;
    }
    const passed = await python.check(step.checks.map((c) => c.expr));
    setResults(passed);
    setChecking(false);
    if (passed.every(Boolean)) {
      setSolved(true);
      onComplete();
    } else {
      setMisses((m) => m + 1);
    }
  }

  // After two misses, point at the first line that differs from the reference solution.
  const firstWrong =
    misses >= 2 && !solved
      ? program.findIndex((p, i) => p.id !== i || (!step.keepIndent && p.indent !== pieces[i].indent))
      : -1;
  const hintIndex = firstWrong === -1 && misses >= 2 && !solved && program.length < step.lines.length ? program.length : firstWrong;

  return (
    <div className="grid w-full gap-10 px-6 py-12 md:px-10 md:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:px-16">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-lime-deep">
          <Puzzle size={16} />
          <p className="eyebrow">Code puzzle</p>
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">{step.title}</h1>
        <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
          <RichText text={step.prompt} />
        </p>
        <p className="mt-3 text-sm text-ink/50">
          Click a line to add it to your program.{" "}
          {step.keepIndent ? "Use the arrows to reorder lines." : "Use the arrows to reorder and indent lines."}
          {step.distractors?.length ? " Not every line belongs." : ""}
        </p>

        <div className="mt-6">
          <p className="eyebrow text-ink/45">Lines</p>
          <div className="mt-3 flex flex-col items-start gap-2">
            {pool.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => add(id)}
                disabled={solved}
                className="inline-flex max-w-full items-center gap-2 rounded-lg bg-paper px-3 py-2 text-left font-mono text-[13px] text-ink ring-1 ring-ink/15 transition-colors hover:ring-ink/40"
              >
                <Plus size={13} className="shrink-0 text-ink/40" />
                <span className="whitespace-pre">{step.keepIndent ? INDENT.repeat(byId(id).indent) + byId(id).text : byId(id).text}</span>
              </button>
            ))}
            {pool.length === 0 && <p className="text-sm text-ink/40">Every line is in your program.</p>}
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-ink/45">Your program</p>
          {program.length > 0 && !solved && (
            <button
              type="button"
              onClick={() => {
                setProgram([]);
                setResults(null);
                setLastRun(null);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-ink/50 hover:text-ink"
            >
              <RotateCcw size={12} /> Start again
            </button>
          )}
        </div>
        <ol aria-label="Your program" className="mt-3 min-h-40 space-y-1.5 rounded-2xl bg-code p-3">
          {program.length === 0 && <li className="px-2 py-3 font-mono text-[13px] text-white/35">Click lines on the left to build the program here.</li>}
          {program.map((p, i) => (
            <li
              key={p.id}
              className={`flex items-center gap-1.5 rounded-lg px-1.5 py-1 ${i === hintIndex ? "bg-danger/25 ring-1 ring-danger/60" : "bg-white/5"}`}
            >
              <span className="w-5 shrink-0 text-right font-mono text-[11px] text-white/30">{i + 1}</span>
              {!step.keepIndent && !solved && (
                <>
                  <IconBtn label="Indent less" disabled={p.indent === 0} onClick={() => indentBy(i, -1)}>
                    <ChevronLeft size={14} />
                  </IconBtn>
                  <IconBtn label="Indent more" disabled={p.indent >= 4} onClick={() => indentBy(i, 1)}>
                    <ChevronRight size={14} />
                  </IconBtn>
                </>
              )}
              <span className="min-w-0 flex-1 overflow-x-auto whitespace-pre font-mono text-[13px] text-white/90">
                {INDENT.repeat(p.indent)}
                {byId(p.id).text}
              </span>
              {!solved && (
                <>
                  <IconBtn label="Move up" disabled={i === 0} onClick={() => swap(i, i - 1)}>
                    <ArrowUp size={13} />
                  </IconBtn>
                  <IconBtn label="Move down" disabled={i === program.length - 1} onClick={() => swap(i, i + 1)}>
                    <ArrowDown size={13} />
                  </IconBtn>
                  <IconBtn label="Remove line" onClick={() => remove(i)}>
                    <X size={13} />
                  </IconBtn>
                </>
              )}
            </li>
          ))}
        </ol>
        {hintIndex >= 0 && (
          <p className="mt-2 text-sm text-danger">
            {hintIndex >= program.length
              ? "A line is still missing from your program."
              : `Start with line ${hintIndex + 1}: check whether it belongs, its position${step.keepIndent ? "" : " and its indentation"}.`}
          </p>
        )}

        {!solved && (
          <button
            type="button"
            onClick={check}
            disabled={program.length === 0 || checking || python.status !== "ready"}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-lime px-5 py-2.5 text-sm font-semibold text-onlime disabled:opacity-40"
          >
            {checking ? <Loader2 size={15} className="animate-spin" /> : <Play size={13} fill="currentColor" />}
            {python.status !== "ready" ? "Loading Python…" : "Run and check"}
          </button>
        )}

        <div className="mt-5 space-y-2">
          {step.checks.map((c, i) => {
            const state = results ? (results[i] ? "pass" : "fail") : "pending";
            return (
              <p key={c.label} className="flex items-center gap-2.5 text-sm">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    state === "pass" ? "bg-lime text-onlime" : state === "fail" ? "bg-danger-soft text-danger" : "text-ink/25"
                  }`}
                >
                  {state === "pass" ? <Check size={12} strokeWidth={3} /> : state === "fail" ? <X size={12} strokeWidth={3} /> : <CircleDashed size={18} />}
                </span>
                <span className={state === "pending" ? "text-ink/45" : "text-ink/85"}>
                  <RichText text={c.label} />
                </span>
              </p>
            );
          })}
        </div>

        {lastRun && (lastRun.stdout || lastRun.error) && (
          <div className="mt-4 rounded-2xl bg-code px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-lime">Output</p>
            {lastRun.stdout && <pre className="mt-1.5 whitespace-pre-wrap font-mono text-xs text-white/85">{lastRun.stdout}</pre>}
            {lastRun.error && (
              <p className="mt-1.5 font-mono text-xs text-[#ff9b9b]">
                {lastRun.error.summary}
                {lastRun.error.line ? ` (line ${lastRun.error.line})` : ""}
              </p>
            )}
          </div>
        )}

        <AnimatePresence>
          {solved && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl bg-lime-soft p-5 ring-1 ring-lime-deep/20">
              <p className="eyebrow text-lime-deep">Solved</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/80">
                <RichText text={step.explanation} />
              </p>
              {done && !lastRun && <PythonCode code={step.lines.join("\n")} className="mt-3 text-[12px]" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white/55 hover:bg-white/10 hover:text-white disabled:opacity-25"
    >
      {children}
    </button>
  );
}
