"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type PyodideStatus = "loading" | "ready" | "error";

export interface VarInfo {
  name: string;
  type: string;
  preview: string;
  /** Dict keys, or the keys of the first row for a list of dicts. */
  keys?: string[];
}

export interface PyError {
  type: string;
  /** The final "ErrorType: message" line, including Python's suggestions. */
  summary: string;
  traceback: string;
  line: number | null;
  vars: VarInfo[];
}

export interface RunResult {
  ok: boolean;
  error?: PyError;
  /** matplotlib figures produced by the run, as base64 PNGs. */
  images?: string[];
  /** Everything the run printed. */
  stdout?: string;
}

/** A value in a traced program: shown inline (`v`, with its type `t`), or a reference `r` to a heap object. */
export type TraceValue = { v: string; t: string } | { r: number };

/** Something a variable can point at: a list, dict, set, object, function, class or generator. */
export interface TraceObject {
  k: "list" | "tuple" | "set" | "dict" | "instance" | "function" | "class" | "generator" | "other";
  /** The Python type name, e.g. "list", "Counter", "Farm". */
  type: string;
  items?: TraceValue[];
  pairs?: [TraceValue, TraceValue][];
  /** Attributes of an object or class, a closure's captured variables, or a generator's locals. */
  attrs?: [string, TraceValue][];
  /** Items not shown because the container is long. */
  more?: number;
  name?: string;
  params?: string;
  repr?: string;
  state?: string;
  line?: number;
}

export interface TraceFrame {
  name: string;
  vars: [string, TraceValue][];
  /** Set on the frame that is returning, on a "return" step. */
  ret?: TraceValue;
}

export interface TraceStep {
  /** The line about to run (for "line"), or the line being left/raised on. */
  line: number;
  event: "line" | "return" | "exception" | "unwind";
  frames: TraceFrame[];
  heap: Record<string, TraceObject>;
  /** How many characters of `TraceResult.out` had been printed by this step. */
  outLen: number;
  exc?: string;
}

export interface TraceResult {
  steps: TraceStep[];
  error: { summary: string; line: number | null } | null;
  /** True when the program was stopped after too many steps (usually an endless loop). */
  truncated: boolean;
  out: string;
}

/** Tracing a program longer than this means it's stuck in one long computation. */
const TRACE_TIMEOUT_MS = 15000;

/** What one playground entry did (see public/nl_play.py). */
export interface PlayResult {
  /** Printed output. */
  out?: string;
  /** The value of a final expression, if it wasn't None. */
  repr?: string;
  type?: string;
  error?: string | null;
  /** Indexes of the goals this entry met. */
  met?: number[];
  vars?: { name: string; type: string; preview: string }[];
  /** The session was lost (Python restarted); start it again. */
  expired?: boolean;
}

/** A playground entry running longer than this is stuck (usually `while True`). */
const PLAY_TIMEOUT_MS = 10000;

interface WorkerMessage {
  type:
    | "ready"
    | "init-error"
    | "stdout"
    | "stderr"
    | "run-start"
    | "run-end"
    | "check-result"
    | "packages-loading"
    | "packages-loaded"
    | "trace-start"
    | "trace-result"
    | "play-start"
    | "play-result";
  data?: string;
  ok?: boolean;
  runId?: number;
  error?: PyError;
  results?: boolean[];
  images?: string[];
  stdout?: string;
}

/** Code that runs longer than this is almost always an infinite loop. */
const RUN_TIMEOUT_MS = 20000;

const TIMEOUT_ERROR: PyError = {
  type: "TimeoutError",
  summary: "TimeoutError: your code ran for more than 20 seconds and was stopped",
  traceback: "",
  line: null,
  vars: [],
};

export function usePyodideWorker() {
  const workerRef = useRef<Worker | null>(null);
  const runResolverRef = useRef<((result: RunResult) => void) | null>(null);
  const checkResolverRef = useRef<((results: boolean[]) => void) | null>(null);
  const traceResolverRef = useRef<((result: TraceResult) => void) | null>(null);
  const traceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startTraceTimeoutRef = useRef<(() => void) | null>(null);
  const playResolverRef = useRef<((result: PlayResult) => void) | null>(null);
  const playTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPlayTimeoutRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runIdRef = useRef(0);
  const startTimeoutRef = useRef<(() => void) | null>(null);

  const [status, setStatus] = useState<PyodideStatus>("loading");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  /** Names of packages being downloaded right now, if any. */
  const [loadingPackages, setLoadingPackages] = useState<string | null>(null);

  const startWorker = useCallback(() => {
    const worker = new Worker("/pyodide-worker.js", { type: "module" });
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const msg = event.data;
      switch (msg.type) {
        case "ready":
          setStatus("ready");
          break;
        case "init-error":
          setStatus("error");
          break;
        case "stdout":
        case "stderr":
          setOutput((prev) => (prev ? `${prev}\n${msg.data}` : (msg.data ?? "")));
          break;
        case "packages-loading":
          setLoadingPackages(msg.data ?? "");
          break;
        case "packages-loaded":
          setLoadingPackages(null);
          break;
        case "run-start":
          // Only time the code itself — package downloads can take a while.
          startTimeoutRef.current?.();
          break;
        case "run-end":
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setRunning(false);
          setLoadingPackages(null);
          runResolverRef.current?.({ ok: !!msg.ok, error: msg.error, images: msg.images ?? [], stdout: msg.stdout ?? "" });
          runResolverRef.current = null;
          break;
        case "check-result":
          checkResolverRef.current?.(msg.results ?? []);
          checkResolverRef.current = null;
          break;
        case "trace-start":
          // Only time the tracing itself, not package downloads.
          startTraceTimeoutRef.current?.();
          break;
        case "trace-result": {
          if (traceTimeoutRef.current) clearTimeout(traceTimeoutRef.current);
          let result: TraceResult;
          try {
            result = JSON.parse(msg.data ?? "");
          } catch {
            result = { steps: [], error: { summary: "The trace couldn't be read.", line: null }, truncated: false, out: "" };
          }
          traceResolverRef.current?.(result);
          traceResolverRef.current = null;
          break;
        }
        case "play-start":
          startPlayTimeoutRef.current?.();
          break;
        case "play-result": {
          if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
          let result: PlayResult;
          try {
            result = JSON.parse(msg.data ?? "");
          } catch {
            result = { error: "The result couldn't be read.", met: [] };
          }
          playResolverRef.current?.(result);
          playResolverRef.current = null;
          break;
        }
      }
    };

    worker.onerror = () => setStatus("error");
    worker.postMessage({ type: "init" });
    return worker;
  }, []);

  useEffect(() => {
    const worker = startWorker();
    return () => {
      worker.terminate();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [startWorker]);

  const run = useCallback(
    (code: string, files?: Record<string, string>, packages?: string[], inputs?: string[]) => {
      return new Promise<RunResult>((resolve) => {
        if (!workerRef.current) {
          resolve({ ok: false, error: { ...TIMEOUT_ERROR, type: "InternalError", summary: "The Python worker isn't available." } });
          return;
        }
        setOutput("");
        setRunning(true);
        runIdRef.current += 1;
        runResolverRef.current = resolve;
        workerRef.current.postMessage({ type: "run", code, files, packages, inputs, runId: runIdRef.current });

        // A worker stuck in a loop can't be interrupted, only replaced.
        startTimeoutRef.current = () => {
          timeoutRef.current = setTimeout(() => {
            workerRef.current?.terminate();
            setRunning(false);
            setStatus("loading");
            runResolverRef.current?.({ ok: false, error: TIMEOUT_ERROR });
            runResolverRef.current = null;
            startWorker();
          }, RUN_TIMEOUT_MS);
        };
      });
    },
    [startWorker],
  );

  /** Evaluates Python expressions against the namespace of the last run. */
  const check = useCallback((exprs: string[]) => {
    return new Promise<boolean[]>((resolve) => {
      if (!workerRef.current || exprs.length === 0) {
        resolve(exprs.map(() => false));
        return;
      }
      checkResolverRef.current = resolve;
      workerRef.current.postMessage({ type: "check", exprs, runId: runIdRef.current });
    });
  }, []);

  /** Runs code line by line and records Python's memory at every step, for the visualiser. */
  const trace = useCallback(
    (code: string, opts: { files?: Record<string, string>; packages?: string[]; inputs?: string[]; maxSteps?: number } = {}) => {
      return new Promise<TraceResult>((resolve) => {
        if (!workerRef.current) {
          resolve({ steps: [], error: { summary: "The Python worker isn't available.", line: null }, truncated: false, out: "" });
          return;
        }
        // One trace at a time: a newer request replaces an older one still waiting.
        traceResolverRef.current?.({ steps: [], error: null, truncated: false, out: "" });
        traceResolverRef.current = resolve;
        runIdRef.current += 1;
        workerRef.current.postMessage({ type: "trace", code, runId: runIdRef.current, ...opts });

        // A worker stuck in one long computation can't be interrupted, only replaced.
        startTraceTimeoutRef.current = () => {
          if (traceTimeoutRef.current) clearTimeout(traceTimeoutRef.current);
          traceTimeoutRef.current = setTimeout(() => {
            workerRef.current?.terminate();
            setStatus("loading");
            traceResolverRef.current?.({
              steps: [],
              error: { summary: "TimeoutError: this program ran for too long to step through", line: null },
              truncated: false,
              out: "",
            });
            traceResolverRef.current = null;
            startWorker();
          }, TRACE_TIMEOUT_MS);
        };
      });
    },
    [startWorker],
  );

  /**
   * Playground console. "reset" starts a session by running the setup code
   * (and works out each goal's target); "eval" runs one entry in that session.
   */
  const play = useCallback(
    (
      action: "reset" | "eval",
      sid: string,
      code: string,
      opts: { goals?: unknown[]; files?: Record<string, string>; packages?: string[] } = {},
    ) => {
      return new Promise<PlayResult>((resolve) => {
        if (!workerRef.current) {
          resolve({ error: "The Python worker isn't available.", met: [] });
          return;
        }
        playResolverRef.current?.({ error: "Interrupted by a newer entry.", met: [] });
        playResolverRef.current = resolve;
        runIdRef.current += 1;
        workerRef.current.postMessage({ type: `play-${action}`, sid, code, runId: runIdRef.current, ...opts });

        startPlayTimeoutRef.current = () => {
          if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
          playTimeoutRef.current = setTimeout(() => {
            workerRef.current?.terminate();
            setStatus("loading");
            playResolverRef.current?.({
              error: "TimeoutError: that ran for more than 10 seconds and was stopped. Python restarted, so your data has been reloaded.",
              expired: true,
              met: [],
            });
            playResolverRef.current = null;
            startWorker();
          }, PLAY_TIMEOUT_MS);
        };
      });
    },
    [startWorker],
  );

  const clearOutput = useCallback(() => setOutput(""), []);

  /** Start downloading a lab's packages and datasets in the background, before the first run. */
  const preload = useCallback((packages?: string[], files?: Record<string, string>) => {
    if (packages?.length || files) workerRef.current?.postMessage({ type: "preload", packages, files });
  }, []);

  return { status, output, running, loadingPackages, run, check, trace, play, preload, clearOutput };
}

export type PythonWorker = ReturnType<typeof usePyodideWorker>;
