"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CornerDownLeft, Lightbulb, Loader2, PartyPopper, Target } from "lucide-react";
import type { PlayResult, PythonWorker } from "@/hooks/usePyodideWorker";
import type { PlaygroundGoal } from "@/lib/curriculum/types";
import PythonCode from "../PythonCode";
import RichText from "../RichText";

interface Entry {
  src: string;
  res: PlayResult | null;
  /** Goals this entry met for the first time. */
  newly?: number[];
}

export interface PythonPlaygroundProps {
  setup: string;
  goals: PlaygroundGoal[];
  suggestions?: string[];
  files?: Record<string, string>;
  packages?: string[];
  python: Pick<PythonWorker, "status" | "play">;
  onInteract?: () => void;
}

/**
 * A live Python console over some prepared data, with goals to reach.
 * Every entry runs for real and remembers what came before, like the REPL.
 */
export default function PythonPlayground({ setup, goals, suggestions = [], files, packages, python, onInteract }: PythonPlaygroundProps) {
  const sid = useId();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [input, setInput] = useState("");
  const [met, setMet] = useState<Set<number>>(new Set());
  const [vars, setVars] = useState<PlayResult["vars"]>([]);
  const [ready, setReady] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hints, setHints] = useState<Set<number>>(new Set());
  const [recall, setRecall] = useState<number | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { status, play } = python;

  const start = useCallback(async () => {
    setReady(false);
    const res = await play("reset", sid, setup, { goals, files, packages });
    setSetupError(res.error ?? null);
    setVars(res.vars ?? []);
    setReady(true);
  }, [play, sid, setup, goals, files, packages]);

  // Start (or restart, after Python was replaced) once the worker is ready.
  const startedFor = useRef<string | null>(null);
  useEffect(() => {
    if (status === "ready" && startedFor.current !== sid) {
      startedFor.current = sid;
      void start();
    }
    if (status === "loading") startedFor.current = null;
  }, [status, sid, start]);

  useEffect(() => {
    historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: "smooth" });
  }, [entries]);

  async function submit(text = input) {
    const src = text.replace(/\s+$/, "");
    if (!src.trim() || busy || !ready) return;
    setBusy(true);
    setInput("");
    setRecall(null);
    setEntries((e) => [...e, { src, res: null }]);
    const res = await play("eval", sid, src);
    const newly = (res.met ?? []).filter((g) => !met.has(g));
    setEntries((e) => e.map((x, i) => (i === e.length - 1 ? { ...x, res, newly } : x)));
    if (newly.length) setMet((m) => new Set([...m, ...newly]));
    if (res.vars) setVars(res.vars);
    setBusy(false);
    onInteract?.();
    if (res.expired) {
      startedFor.current = null;
      if (status === "ready") void start();
    }
    inputRef.current?.focus();
  }

  const history = entries.map((e) => e.src);
  const allDone = goals.length > 0 && met.size === goals.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="min-w-0">
        <p className="eyebrow text-ink/45">Your data</p>
        <PythonCode code={setup} className="mt-3 max-h-56 overflow-y-auto" />

        <div className="mt-4 overflow-hidden rounded-2xl bg-code ring-1 ring-ink/10">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">Python console</p>
            {!ready && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-white/50">
                <Loader2 size={12} className="animate-spin" /> {status === "ready" ? "Loading your data…" : "Starting Python…"}
              </span>
            )}
          </div>
          <div ref={historyRef} className="max-h-80 min-h-32 space-y-3 overflow-y-auto px-4 py-3 font-mono text-[13px] leading-relaxed">
            {entries.length === 0 && (
              <p className="text-white/35">Type Python below and press Enter. It runs for real, using the data above.</p>
            )}
            {entries.map((e, i) => (
              <div key={i}>
                {e.src.split("\n").map((line, j) => (
                  <p key={j} className="whitespace-pre-wrap text-white/90">
                    <span className="mr-2 select-none text-lime">{j === 0 ? ">>>" : "..."}</span>
                    {line}
                  </p>
                ))}
                {!e.res && <p className="text-white/40">running…</p>}
                {e.res?.out && <p className="whitespace-pre-wrap text-white/70">{e.res.out.replace(/\n$/, "")}</p>}
                {e.res?.repr !== undefined && (
                  <p className="flex flex-wrap items-baseline gap-2 whitespace-pre-wrap text-white">
                    <span className="break-all">{e.res.repr}</span>
                    <span className="rounded bg-white/10 px-1.5 py-px font-sans text-[10px] font-semibold text-white/55">{e.res.type}</span>
                  </p>
                )}
                {e.res?.error && <p className="whitespace-pre-wrap text-[#ff9b9b]">{e.res.error}</p>}
                {e.newly && e.newly.length > 0 && (
                  <p className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-lime/15 px-2 py-0.5 font-sans text-[11px] font-semibold text-lime">
                    <Check size={11} strokeWidth={3} /> Goal {e.newly.map((m) => m + 1).join(" and ")} done
                  </p>
                )}
              </div>
            ))}
          </div>
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              void submit();
            }}
            className="flex items-start gap-2 border-t border-white/10 px-4 py-3"
          >
            <span className="select-none pt-1.5 font-mono text-[13px] text-lime">&gt;&gt;&gt;</span>
            <textarea
              ref={inputRef}
              value={input}
              rows={Math.min(5, Math.max(1, input.split("\n").length))}
              onChange={(ev) => setInput(ev.target.value)}
              onKeyDown={(ev) => {
                if (ev.key === "Enter" && !ev.shiftKey) {
                  ev.preventDefault();
                  void submit();
                } else if (ev.key === "ArrowUp" && !input.includes("\n") && history.length) {
                  ev.preventDefault();
                  const i = recall === null ? history.length - 1 : Math.max(0, recall - 1);
                  setRecall(i);
                  setInput(history[i]);
                } else if (ev.key === "ArrowDown" && recall !== null) {
                  ev.preventDefault();
                  const i = recall + 1;
                  if (i >= history.length) {
                    setRecall(null);
                    setInput("");
                  } else {
                    setRecall(i);
                    setInput(history[i]);
                  }
                }
              }}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label="Python to run"
              placeholder={ready ? "Type Python here" : ""}
              disabled={!ready}
              className="min-w-0 flex-1 resize-none bg-transparent py-1 font-mono text-[13px] text-white outline-none placeholder:text-white/25"
            />
            <button
              type="submit"
              disabled={!ready || busy || !input.trim()}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-lime px-3 py-1.5 text-xs font-semibold text-onlime disabled:opacity-40"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <CornerDownLeft size={13} />} Run
            </button>
          </form>
        </div>
        <p className="mt-2 text-xs text-ink/45">Enter runs it. Shift+Enter adds a line. The up arrow brings back what you typed before.</p>

        {suggestions.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-ink/50">Try one of these</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setInput(s);
                    inputRef.current?.focus();
                  }}
                  className="rounded-md bg-cream px-2.5 py-1 font-mono text-[12.5px] text-ink/80 ring-1 ring-ink/10 hover:ring-ink/30"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {setupError && <p className="mt-3 rounded-xl bg-danger-soft px-3.5 py-2.5 font-mono text-sm text-danger">Setup failed: {setupError}</p>}
      </div>

      <div className="min-w-0 space-y-5">
        <div className="rounded-3xl bg-cream/70 p-5 ring-1 ring-ink/10">
          <div className="flex items-center justify-between gap-3">
            <p className="eyebrow inline-flex items-center gap-1.5 text-ink/50">
              <Target size={13} /> Goals
            </p>
            <span className="text-xs font-semibold tabular-nums text-ink/50">
              {met.size} of {goals.length}
            </span>
          </div>
          <ol className="mt-4 space-y-2.5">
            {goals.map((g, i) => {
              const done = met.has(i);
              return (
                <li key={i} className={`rounded-xl px-3.5 py-3 ${done ? "bg-lime-soft ring-1 ring-lime-deep/25" : "bg-paper ring-1 ring-ink/10"}`}>
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                        done ? "bg-lime-deep text-paper" : "bg-cream text-ink/50"
                      }`}
                    >
                      {done ? <Check size={11} strokeWidth={3} /> : i + 1}
                    </span>
                    <p className={`min-w-0 flex-1 text-sm leading-snug ${done ? "text-ink/70" : "text-ink"}`}>
                      <RichText text={g.text} />
                    </p>
                    {g.hint && !done && (
                      <button
                        type="button"
                        onClick={() => setHints((h) => new Set(h).add(i))}
                        aria-label="Show a hint"
                        title="Hint"
                        className="shrink-0 rounded-md p-1 text-ink/40 hover:bg-cream hover:text-ink"
                      >
                        <Lightbulb size={15} />
                      </button>
                    )}
                  </div>
                  <AnimatePresence>
                    {g.hint && hints.has(i) && !done && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="ml-8 mt-2 overflow-hidden text-[13px] leading-relaxed text-ink/60"
                      >
                        <RichText text={g.hint} />
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ol>
          {allDone && (
            <p className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime px-3.5 py-2 text-sm font-semibold text-onlime">
              <PartyPopper size={15} /> Every goal done. Keep experimenting if you like.
            </p>
          )}
        </div>

        <div className="rounded-3xl bg-paper p-5 ring-1 ring-ink/10">
          <p className="eyebrow text-ink/50">Variables</p>
          <table className="mt-3 w-full text-left">
            <tbody>
              {(vars ?? []).map((v) => (
                <tr key={v.name} className="border-t border-ink/5 align-top first:border-t-0">
                  <td className="py-1.5 pr-3 font-mono text-[12.5px] text-ink">{v.name}</td>
                  <td className="py-1.5 pr-3">
                    <span className="rounded bg-cream px-1.5 py-px text-[10px] font-semibold text-ink/55">{v.type}</span>
                  </td>
                  <td className="break-all py-1.5 font-mono text-[12px] text-ink/60">{v.preview}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
