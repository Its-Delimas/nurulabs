"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, Loader2, Table2 } from "lucide-react";
import type { TraceTableStep } from "@/lib/curriculum/types";
import type { PythonWorker } from "@/hooks/usePyodideWorker";
import { sameValue, traceRows } from "@/lib/traceRows";
import RichText from "../RichText";
import PythonCode from "../PythonCode";

const CodeVisualiser = dynamic(() => import("../visualiser/CodeVisualiser"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-ink/5" />,
});

/** Predict the variables' values each time a line runs; the answers come from really running the code. */
export default function TraceTableView({
  step,
  done,
  onComplete,
  files,
  packages,
  python,
}: {
  step: TraceTableStep;
  done: boolean;
  onComplete: () => void;
  /** The lab's files and packages, so the code can open and import them. */
  files?: Record<string, string>;
  packages?: string[];
  python: Pick<PythonWorker, "status" | "trace">;
}) {
  const [expected, setExpected] = useState<(string | null)[][] | null>(null);
  const [answers, setAnswers] = useState<string[][]>([]);
  const [checked, setChecked] = useState<boolean[][] | null>(null);
  const [tries, setTries] = useState(0);
  const [solved, setSolved] = useState(done);
  const [watch, setWatch] = useState(false);
  const loaded = useRef(false);

  const { status, trace } = python;
  useEffect(() => {
    if (status !== "ready" || loaded.current) return;
    loaded.current = true;
    void trace(step.code, { files, packages }).then((t) => {
      const rows = traceRows(t, step.line, step.columns);
      setExpected(rows);
      // The first row is filled in as a worked example; a finished table shows everything.
      setAnswers(rows.map((row, r) => row.map((v) => (done || r === 0 ? (v ?? "") : ""))));
    });
  }, [status, trace, step, done, files, packages]);

  function check() {
    if (!expected) return;
    const marks = expected.map((row, r) => row.map((v, c) => sameValue(answers[r]?.[c] ?? "", v)));
    setChecked(marks);
    setTries((t) => t + 1);
    if (marks.every((row) => row.every(Boolean))) {
      setSolved(true);
      onComplete();
    }
  }

  function reveal() {
    if (!expected) return;
    setAnswers(expected.map((row) => row.map((v) => v ?? "")));
    setChecked(expected.map((row) => row.map(() => true)));
    setSolved(true);
    onComplete();
  }

  return (
    <div className="w-full px-6 py-12 md:px-10 md:py-14 xl:px-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-lime-deep">
            <Table2 size={16} />
            <p className="eyebrow">Trace table</p>
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">{step.title}</h1>
          <p className="mt-4 text-[16px] leading-relaxed text-ink/70">
            <RichText text={step.prompt} />
          </p>
          <p className="mt-3 text-sm text-ink/50">
            Each row is the moment line {step.line} has just finished running. The first row is filled in for you.
          </p>
          <PythonCode code={step.code} lineNumbers highlightLine={step.line} className="mt-5" />
        </div>

        <div className="min-w-0">
          {!expected ? (
            <p className="flex items-center gap-2 text-sm text-ink/55">
              <Loader2 size={15} className="animate-spin" /> Running the code to build the table…
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-ink/10 bg-cream/60">
                      <th className="px-4 py-2.5 text-xs font-semibold text-ink/50">Time</th>
                      {step.columns.map((c) => (
                        <th key={c} className="px-3 py-2.5 font-mono text-[13px] font-semibold text-ink">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {expected.map((row, r) => (
                      <tr key={r} className="border-b border-ink/5 last:border-0">
                        <td className="px-4 py-2 text-xs text-ink/45">{r === 0 ? "1st (example)" : `${r + 1}${["st", "nd", "rd"][r] ?? "th"}`}</td>
                        {row.map((_, c) => {
                          const mark = checked?.[r]?.[c];
                          const locked = r === 0 || solved;
                          return (
                            <td key={c} className="px-2 py-1.5">
                              <input
                                value={answers[r]?.[c] ?? ""}
                                readOnly={locked}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setAnswers((a) => a.map((rowA, i) => (i === r ? rowA.map((x, k) => (k === c ? v : x)) : rowA)));
                                  setChecked(null);
                                }}
                                aria-label={`${step.columns[c]}, row ${r + 1}`}
                                spellCheck={false}
                                className={`w-full min-w-16 rounded-md px-2.5 py-1.5 font-mono text-[13px] outline-none ring-1 ${
                                  r === 0
                                    ? "bg-cream text-ink/55 ring-transparent"
                                    : mark === true
                                      ? "bg-lime-soft text-ink ring-lime-deep/40"
                                      : mark === false
                                        ? "bg-danger-soft text-ink ring-danger/40"
                                        : "bg-paper text-ink ring-ink/15 focus:ring-lime-deep"
                                }`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {!solved && (
                  <button type="button" onClick={check} className="rounded-md bg-lime px-5 py-2.5 text-sm font-semibold text-onlime">
                    Check my table
                  </button>
                )}
                {!solved && tries >= 2 && (
                  <button type="button" onClick={reveal} className="text-sm font-semibold text-ink/60 underline underline-offset-4 hover:text-ink">
                    Show the answers
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setWatch((w) => !w)}
                  className="inline-flex items-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-semibold text-ink/70 ring-1 ring-ink/15 hover:text-ink"
                >
                  <Eye size={15} /> {watch ? "Hide the run" : "Watch it run"}
                </button>
                {checked && !solved && (
                  <span className="text-sm text-danger">
                    {checked.flat().filter((x) => !x).length} cell{checked.flat().filter((x) => !x).length === 1 ? "" : "s"} to look at again.
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-ink/45">Write values as Python would show them: text with or without quotes, True/False, None for nothing yet.</p>
            </>
          )}

          <AnimatePresence>
            {solved && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl bg-lime-soft p-5 ring-1 ring-lime-deep/20">
                <p className="eyebrow text-lime-deep">What the table shows</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/80">
                  <RichText text={step.explanation} />
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {watch && (
        <div className="mt-10 rounded-[28px] bg-paper p-5 ring-1 ring-ink/10 md:p-8">
          <CodeVisualiser code={step.code} editable={false} files={files} packages={packages} python={python} />
        </div>
      )}
    </div>
  );
}
