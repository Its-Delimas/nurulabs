"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Pencil, Play, RotateCcw } from "lucide-react";
import type { PythonWorker, RunResult } from "@/hooks/usePyodideWorker";
import PythonCode from "./PythonCode";

const CodeEditor = dynamic(() => import("./CodeEditor"), {
  ssr: false,
  loading: () => <div className="h-48 bg-code" />,
});

/**
 * A lesson's code sample that learners can run, edit and run again.
 * Runs in the lab's Python worker with the lab's files and packages.
 */
export default function RunnableCode({
  code,
  files,
  packages,
  expectError,
  python,
}: {
  code: string;
  files?: Record<string, string>;
  packages?: string[];
  /** The sample fails on purpose with this error type. */
  expectError?: string;
  python: Pick<PythonWorker, "status" | "run">;
}) {
  const [source, setSource] = useState(code);
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setResult(await python.run(source, files, packages));
    setRunning(false);
  }

  const lines = source.split("\n").length;
  const intended = !!result?.error && result.error.type === expectError;

  return (
    <div className="overflow-hidden rounded-2xl bg-code ring-1 ring-ink/10">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2">
        <span className="font-mono text-xs text-white/45">example.py</span>
        <div className="flex items-center gap-1.5">
          {source !== code && (
            <button
              type="button"
              onClick={() => {
                setSource(code);
                setResult(null);
              }}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/50 hover:bg-white/5 hover:text-white"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/60 hover:bg-white/5 hover:text-white"
          >
            <Pencil size={12} /> {editing ? "Done editing" : "Edit"}
          </button>
          <button
            type="button"
            onClick={run}
            disabled={python.status !== "ready" || running}
            className="inline-flex items-center gap-1.5 rounded-md bg-lime px-3 py-1 text-xs font-semibold text-onlime disabled:opacity-40"
          >
            {running ? <Loader2 size={12} className="animate-spin" /> : <Play size={11} fill="currentColor" />}
            {python.status !== "ready" ? "Loading Python…" : "Run"}
          </button>
        </div>
      </div>

      {editing ? (
        <div style={{ height: Math.min(420, Math.max(160, lines * 22 + 40)) }}>
          <CodeEditor value={source} onChange={setSource} />
        </div>
      ) : (
        <PythonCode code={source} lineNumbers className="rounded-none" />
      )}

      {result && (
        <div className="border-t border-white/10 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-lime">Output</p>
          <pre className="mt-1.5 whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/85">
            {result.stdout || (!result.error && !result.images?.length ? <span className="text-white/35">(nothing printed)</span> : null)}
          </pre>
          {result.images?.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={`data:image/png;base64,${src}`} alt={`Chart ${i + 1} from the example`} className="mt-2 max-w-full rounded-xl bg-white" />
          ))}
          {result.error && (
            <p className="mt-1.5 whitespace-pre-wrap font-mono text-xs text-[#ff9b9b]">
              {result.error.summary}
              {result.error.line ? ` (line ${result.error.line})` : ""}
            </p>
          )}
          {intended && <p className="mt-1.5 text-xs text-white/55">This error is the point of the example: read it, then see the lesson text.</p>}
        </div>
      )}
    </div>
  );
}
