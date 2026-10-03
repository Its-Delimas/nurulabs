"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight, Loader2, Pause, Pencil, Play, RotateCcw, TriangleAlert } from "lucide-react";
import type { PythonWorker, TraceObject, TraceResult, TraceStep, TraceValue } from "@/hooks/usePyodideWorker";
import PythonCode from "../PythonCode";

const CodeEditor = dynamic(() => import("../CodeEditor"), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-2xl bg-code" />,
});

const PLAY_MS = 700;

/** Colour for an inline value, by Python type. */
function valueClass(t: string) {
  if (t === "int" || t === "float" || t === "complex") return "text-sky";
  if (t === "str") return "text-lime-deep";
  if (t === "bool") return "text-violet";
  if (t === "NoneType") return "text-ink/45 italic";
  return "text-ink/70";
}

function isRef(v: TraceValue): v is { r: number } {
  return "r" in v;
}

/** A value inside a frame or object: inline text, or a dot that an arrow leaves from. */
function Value({ value, heap }: { value: TraceValue; heap: Record<string, TraceObject> }) {
  if (!isRef(value)) {
    return <span className={`font-mono text-[13px] ${valueClass(value.t)}`}>{value.v}</span>;
  }
  const target = heap[String(value.r)];
  const label = target ? (target.k === "instance" ? `${target.type} object` : target.type) : "object";
  return (
    <span className="inline-flex items-center gap-1.5" title={`points to the ${label}`}>
      <span data-ptr={value.r} aria-label={`points to the ${label}`} className="inline-block h-2.5 w-2.5 rounded-full bg-ink/70" />
    </span>
  );
}

function objectTitle(obj: TraceObject) {
  switch (obj.k) {
    case "instance":
      return `${obj.type} object`;
    case "class":
      return `class ${obj.name}`;
    case "function":
      return obj.type === "method" ? "method" : "function";
    case "generator":
      return `generator ${obj.name}()`;
    default:
      return obj.type;
  }
}

function Rows({ rows, heap }: { rows: [React.ReactNode, TraceValue][]; heap: Record<string, TraceObject> }) {
  return (
    <table className="w-full text-left">
      <tbody>
        {rows.map(([name, value], i) => (
          <tr key={i} className="border-t border-ink/5 first:border-t-0">
            <td className="py-1 pr-3 font-mono text-[12.5px] text-ink/70">{name}</td>
            <td className="py-1 text-right">
              <Value value={value} heap={heap} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ObjectCard({ id, obj, heap }: { id: string; obj: TraceObject; heap: Record<string, TraceObject> }) {
  const sequence = obj.k === "list" || obj.k === "tuple" || obj.k === "set";
  return (
    <div data-obj={id} className="rounded-xl bg-paper px-3 py-2.5 ring-1 ring-ink/15">
      <p className="text-[11px] font-semibold tracking-wide text-ink/50">{objectTitle(obj)}</p>
      <div className="mt-1.5">
        {sequence && (
          <div className="flex flex-wrap gap-1">
            {(obj.items ?? []).map((item, i) => (
              <div
                key={i}
                className={`flex min-w-9 flex-col items-center rounded-md px-1.5 pb-1 pt-0.5 ${
                  obj.k === "tuple" ? "border border-dashed border-ink/20" : "bg-cream"
                }`}
              >
                {obj.k !== "set" && <span className="font-mono text-[9px] text-ink/35">{i}</span>}
                <Value value={item} heap={heap} />
              </div>
            ))}
            {(obj.items ?? []).length === 0 && <span className="font-mono text-[12px] text-ink/40">empty</span>}
          </div>
        )}
        {obj.k === "dict" &&
          ((obj.pairs ?? []).length ? (
            <Rows rows={(obj.pairs ?? []).map(([k, v]) => [<Value key="k" value={k} heap={heap} />, v])} heap={heap} />
          ) : (
            <span className="font-mono text-[12px] text-ink/40">empty</span>
          ))}
        {(obj.k === "instance" || obj.k === "class") &&
          ((obj.attrs ?? []).length ? (
            <Rows rows={(obj.attrs ?? []).map(([k, v]) => [k, v])} heap={heap} />
          ) : (
            <span className="font-mono text-[12px] text-ink/40">no attributes yet</span>
          ))}
        {obj.k === "function" && (
          <>
            <p className="font-mono text-[12.5px] text-ink">
              <span className="text-lime-deep">def</span> {obj.name}
              {obj.params}
            </p>
            {obj.attrs && obj.attrs.length > 0 && (
              <div className="mt-1.5 border-t border-ink/10 pt-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/40">Remembers</p>
                <Rows rows={obj.attrs.map(([k, v]) => [k, v])} heap={heap} />
              </div>
            )}
          </>
        )}
        {obj.k === "generator" && (
          <>
            <p className="text-[12px] text-ink/60">
              {obj.state === "GEN_CREATED"
                ? "not started yet"
                : obj.state === "GEN_SUSPENDED"
                  ? `paused at line ${obj.line}`
                  : obj.state === "GEN_CLOSED"
                    ? "finished"
                    : "running"}
            </p>
            {obj.attrs && obj.attrs.length > 0 && <Rows rows={obj.attrs.map(([k, v]) => [k, v])} heap={heap} />}
          </>
        )}
        {obj.k === "other" && <p className="break-all font-mono text-[12.5px] text-ink/80">{obj.repr}</p>}
        {!!obj.more && <p className="mt-1 text-[11px] text-ink/45">+ {obj.more} more</p>}
      </div>
    </div>
  );
}

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Draws an arrow from every reference dot in `root` to the object it points
 * at, straight into the SVG layer (positions depend on the rendered layout).
 */
function drawArrows(root: HTMLElement, layer: SVGGElement, markerId: string) {
  const box = root.getBoundingClientRect();
  layer.replaceChildren();
  root.querySelectorAll<HTMLElement>("[data-ptr]").forEach((dot) => {
    const target = root.querySelector<HTMLElement>(`[data-obj="${dot.dataset.ptr}"]`);
    if (!target) return;
    const a = dot.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const x1 = a.left + a.width / 2 - box.left;
    const y1 = a.top + a.height / 2 - box.top;
    const y2 = b.top + 12 - box.top;
    let d: string;
    if (b.left - box.left > x1 + 12) {
      // Target to the right: a smooth S-curve into its left edge.
      const x2 = b.left - box.left - 2;
      const bend = Math.max(24, (x2 - x1) / 2);
      d = `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
    } else {
      // Target below or to the left (stacked layout, nested objects): loop round its right edge.
      const x2 = b.right - box.left + 2;
      const out = Math.max(x1, x2) + 36;
      d = `M ${x1} ${y1} C ${out} ${y1}, ${out} ${y2}, ${x2} ${y2}`;
    }
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke-width", "1.6");
    path.setAttribute("class", "stroke-ink/45");
    path.setAttribute("marker-end", `url(#${markerId})`);
    layer.appendChild(path);
  });
}

function describeStep(step: TraceStep, last: boolean, result: TraceResult) {
  const frame = step.frames[step.frames.length - 1];
  if (step.event === "exception") return { tone: "error", text: `${step.exc} (line ${step.line})` };
  if (step.event === "unwind") return { tone: "error", text: `${frame?.name}() stops early: the error passes back to whoever called it` };
  if (step.event === "return") {
    if (last && step.frames.length <= 1) {
      if (result.error) return { tone: "error", text: `The program stopped with ${result.error.summary}` };
      return { tone: "done", text: "The program has finished." };
    }
    if (frame?.ret) {
      const v = isRef(frame.ret) ? "an object" : frame.ret.v;
      return { tone: "info", text: `${frame.name}() returns ${v}` };
    }
    return { tone: "info", text: `Leaving ${frame?.name}` };
  }
  return { tone: "info", text: `Line ${step.line} runs next` };
}

export interface CodeVisualiserProps {
  code: string;
  /** Let the learner change the code and visualise their own version. */
  editable?: boolean;
  /** Lines typed in answer to input(), in order. */
  inputs?: string[];
  /** The lab's files and packages, so traced code can open and import them. */
  files?: Record<string, string>;
  packages?: string[];
  python: Pick<PythonWorker, "status" | "trace">;
  onInteract?: () => void;
}

/**
 * Step through real Python: the line about to run, every call frame and its
 * variables, the objects they point at (with arrows), and the output so far.
 */
export default function CodeVisualiser({ code, editable = true, inputs, files, packages, python, onInteract }: CodeVisualiserProps) {
  const [source, setSource] = useState(code);
  const [draft, setDraft] = useState(code);
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState<TraceResult | null>(null);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const memoryRef = useRef<HTMLDivElement>(null);
  const arrowsRef = useRef<SVGGElement>(null);
  const markerId = useId().replace(/:/g, "");

  const { status, trace } = python;
  const visualise = useCallback(
    async (text: string) => {
      setBusy(true);
      setPlaying(false);
      const r = await trace(text, { inputs, files, packages });
      setResult(r);
      setIndex(0);
      setBusy(false);
    },
    [trace, inputs, files, packages],
  );

  // Trace the starting code as soon as Python is ready.
  const started = useRef(false);
  useEffect(() => {
    if (status === "ready" && !started.current) {
      started.current = true;
      void visualise(code);
    }
  }, [status, code, visualise]);

  const steps = result?.steps ?? [];
  const total = steps.length;
  const step = steps[Math.min(index, Math.max(0, total - 1))];
  const atEnd = index >= total - 1;

  useEffect(() => {
    if (!playing || atEnd) return;
    const id = setTimeout(() => {
      setIndex((i) => i + 1);
      if (index + 1 >= total - 1) setPlaying(false);
    }, PLAY_MS);
    return () => clearTimeout(id);
  }, [playing, index, atEnd, total]);

  function go(i: number) {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(total - 1, i)));
    onInteract?.();
  }

  // Arrows depend on where everything was laid out, so redraw after every render that moves things.
  useLayoutEffect(() => {
    if (memoryRef.current && arrowsRef.current) drawArrows(memoryRef.current, arrowsRef.current, markerId);
  }, [index, result, editing, markerId]);
  useEffect(() => {
    const root = memoryRef.current;
    if (!root) return;
    const observer = new ResizeObserver(() => {
      if (arrowsRef.current) drawArrows(root, arrowsRef.current, markerId);
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [markerId]);

  const output = result && step ? (atEnd ? result.out : result.out.slice(0, step.outLen)) : "";
  const caption = step && result ? describeStep(step, atEnd, result) : null;
  const heap = step?.heap ?? {};
  const objectIds = Object.keys(heap).sort((a, b) => Number(a) - Number(b));

  return (
    <div
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
      onKeyDown={(e) => {
        if (editing || !total) return;
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      {/* Code, controls and output */}
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-ink/45">{editing ? "Edit the code" : "The code"}</p>
          {editable && !editing && (
            <button
              type="button"
              onClick={() => {
                setDraft(source);
                setEditing(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-ink/60 ring-1 ring-ink/15 hover:text-ink"
            >
              <Pencil size={13} /> Edit code
            </button>
          )}
        </div>

        {editing ? (
          <div className="mt-3">
            <div className="h-72 overflow-hidden rounded-2xl">
              <CodeEditor value={draft} onChange={setDraft} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSource(draft);
                  setEditing(false);
                  onInteract?.();
                  void visualise(draft);
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-lime px-4 py-2 text-sm font-semibold text-onlime"
              >
                <Play size={14} fill="currentColor" /> Run and step through
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-md px-4 py-2 text-sm font-semibold text-ink/60 ring-1 ring-ink/15">
                Cancel
              </button>
              {draft !== code && (
                <button type="button" onClick={() => setDraft(code)} className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-ink/50 hover:text-ink">
                  <RotateCcw size={13} /> Original code
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="relative mt-3">
            <PythonCode code={source} lineNumbers highlightLine={step?.line ?? null} className="max-h-[26rem] overflow-y-auto" />
            {(busy || status !== "ready") && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-code/70 text-sm text-white/80">
                <Loader2 size={16} className="mr-2 animate-spin" />
                {status !== "ready" ? "Starting Python…" : "Running your code…"}
              </div>
            )}
          </div>
        )}

        {!editing && result && total > 0 && (
          <>
            <div className="mt-4 flex items-center gap-1.5">
              <Ctrl label="First step" onClick={() => go(0)} disabled={index === 0}>
                <ChevronFirst size={16} />
              </Ctrl>
              <Ctrl label="Previous step" onClick={() => go(index - 1)} disabled={index === 0}>
                <ChevronLeft size={16} />
              </Ctrl>
              <button
                type="button"
                onClick={() => {
                  if (atEnd) setIndex(0);
                  setPlaying((p) => !p);
                  onInteract?.();
                }}
                className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3.5 py-2 text-xs font-semibold text-paper"
              >
                {playing ? <Pause size={13} /> : <Play size={13} fill="currentColor" />}
                {playing ? "Pause" : atEnd ? "Replay" : "Play"}
              </button>
              <Ctrl label="Next step" onClick={() => go(index + 1)} disabled={atEnd} primary>
                <ChevronRight size={16} />
              </Ctrl>
              <Ctrl label="Last step" onClick={() => go(total - 1)} disabled={atEnd}>
                <ChevronLast size={16} />
              </Ctrl>
              <span className="ml-auto text-xs tabular-nums text-ink/50">
                Step {index + 1} of {total}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, total - 1)}
              value={index}
              onChange={(e) => go(Number(e.target.value))}
              aria-label="Step"
              className="mt-3 w-full accent-[var(--color-lime-deep)]"
            />
          </>
        )}

        {caption && !editing && (
          <p
            className={`mt-3 rounded-xl px-3.5 py-2.5 text-sm ${
              caption.tone === "error" ? "bg-danger-soft text-danger" : caption.tone === "done" ? "bg-lime-soft text-lime-deep" : "bg-cream text-ink/75"
            }`}
          >
            {caption.text}
          </p>
        )}
        {result?.truncated && atEnd && !editing && (
          <p className="mt-2 flex items-start gap-2 rounded-xl bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
            <TriangleAlert size={15} className="mt-0.5 shrink-0" /> Stopped after {total} steps. Is there a loop that never ends?
          </p>
        )}
        {result && total === 0 && result.error && !editing && (
          <p className="mt-3 rounded-xl bg-danger-soft px-3.5 py-2.5 font-mono text-[13px] text-danger">
            {result.error.summary}
            {result.error.line ? ` (line ${result.error.line})` : ""}
          </p>
        )}

        {!editing && (
          <div className="mt-4 overflow-hidden rounded-2xl bg-code">
            <p className="border-b border-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-white/45">Printed output</p>
            <pre className="min-h-12 whitespace-pre-wrap px-4 py-3 font-mono text-[13px] leading-relaxed text-white/85">
              {output || <span className="text-white/30">Nothing printed yet.</span>}
            </pre>
          </div>
        )}
      </div>

      {/* Python's memory: frames on the left, objects on the right, arrows between */}
      <div ref={memoryRef} className="relative min-w-0 rounded-3xl bg-cream/70 p-4 ring-1 ring-ink/10 md:p-5">
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" className="fill-ink/55" />
            </marker>
          </defs>
          <g ref={arrowsRef} />
        </svg>
        <div className="relative grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <p className="eyebrow text-ink/45">Frames</p>
            <div className="mt-3 space-y-3">
              {step?.frames.map((frame, i) => {
                const active = i === step.frames.length - 1;
                return (
                  <div
                    key={i}
                    className={`rounded-xl bg-paper px-3 py-2.5 ${active ? "ring-2 ring-lime-deep" : "ring-1 ring-ink/10 opacity-80"}`}
                  >
                    <p className="text-[11px] font-semibold tracking-wide text-ink/55">
                      {frame.name === "Global frame" || frame.name.startsWith("class ") ? frame.name : `${frame.name}()`}
                    </p>
                    {frame.vars.length === 0 && !frame.ret ? (
                      <p className="mt-1 font-mono text-[12px] text-ink/35">no variables yet</p>
                    ) : (
                      <div className="mt-1">
                        <Rows rows={frame.vars.map(([k, v]) => [k, v])} heap={heap} />
                        {frame.ret && (
                          <div className="mt-1 border-t border-ink/10 pt-1">
                            <Rows rows={[[<span key="r" className="font-sans text-[11px] font-semibold text-lime-deep">Return value</span>, frame.ret]]} heap={heap} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {!step && <div className="h-20 animate-pulse rounded-xl bg-ink/5" />}
            </div>
          </div>
          <div className="min-w-0">
            <p className="eyebrow text-ink/45">Objects</p>
            <div className="mt-3 space-y-3">
              {objectIds.map((id) => (
                <ObjectCard key={id} id={id} obj={heap[id]} heap={heap} />
              ))}
              {step && objectIds.length === 0 && (
                <p className="text-[12px] leading-relaxed text-ink/40">
                  Lists, dicts, functions and other objects appear here, with arrows from the names that point at them.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Ctrl({
  label,
  onClick,
  disabled,
  primary,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md disabled:opacity-30 ${
        primary ? "bg-lime text-onlime" : "text-ink/70 ring-1 ring-ink/15 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
