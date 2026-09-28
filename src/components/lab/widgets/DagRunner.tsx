"use client";

import { useEffect, useRef, useState } from "react";

type Status = "queued" | "running" | "retry" | "success" | "failed" | "upstream_failed";

const TASKS: { id: string; col: number; row: number; deps: string[] }[] = [
  { id: "extract_prices", col: 0, row: 0, deps: [] },
  { id: "extract_markets", col: 0, row: 1, deps: [] },
  { id: "clean_prices", col: 1, row: 0.5, deps: ["extract_prices", "extract_markets"] },
  { id: "load_prices", col: 2, row: 0.5, deps: ["clean_prices"] },
  { id: "test_prices", col: 3, row: 0, deps: ["load_prices"] },
  { id: "price_alerts", col: 3, row: 1, deps: ["load_prices"] },
  { id: "weekly_report", col: 4, row: 0, deps: ["test_prices"] },
];

const STYLE: Record<Status, string> = {
  queued: "bg-paper text-ink/60 ring-ink/15",
  running: "bg-sky/15 text-ink ring-sky",
  retry: "bg-sun/20 text-ink ring-sun",
  success: "bg-lime-soft text-ink ring-lime-deep/40",
  failed: "bg-danger text-paper ring-danger",
  upstream_failed: "bg-danger-soft text-danger ring-danger/30",
};

const X = (c: number) => 10 + c * 20; // % across
const Y = (r: number) => 25 + r * 50; // % down

/** Schedule a DAG: dependency order, retries, and upstream failures. */
export default function DagRunner({ onInteract }: { onInteract: () => void }) {
  const [broken, setBroken] = useState("clean_prices");
  const [kind, setKind] = useState<"none" | "temporary" | "permanent">("none");
  const [retries, setRetries] = useState(1);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [log, setLog] = useState<string[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  function run() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    onInteract();
    // Work out the whole run first, then replay it as a timeline.
    const final: Record<string, Status> = {};
    const frames: { s: Record<string, Status>; line: string }[] = [];
    const now: Record<string, Status> = Object.fromEntries(TASKS.map((t) => [t.id, "queued"]));
    const snap = (line: string) => frames.push({ s: { ...now }, line });
    snap("scheduler: run started");
    const cols = [...new Set(TASKS.map((t) => t.col))];
    for (const c of cols) {
      const wave = TASKS.filter((t) => t.col === c);
      const ready = wave.filter((t) => t.deps.every((d) => final[d] === "success"));
      for (const t of wave.filter((w) => !ready.includes(w))) {
        final[t.id] = now[t.id] = "upstream_failed";
      }
      if (wave.length > ready.length) snap(`${wave.filter((w) => !ready.includes(w)).map((w) => w.id).join(", ")}: upstream_failed (not run)`);
      if (!ready.length) continue;
      ready.forEach((t) => (now[t.id] = "running"));
      snap(`running ${ready.map((t) => t.id).join(" + ")}`);
      for (const t of ready) {
        const fails = kind !== "none" && t.id === broken;
        const failuresBeforeSuccess = kind === "temporary" ? 1 : Infinity;
        let attempt = 1;
        while (fails && attempt <= failuresBeforeSuccess && attempt <= retries) {
          now[t.id] = "retry";
          snap(`${t.id}: attempt ${attempt} failed, retrying (${attempt}/${retries})`);
          now[t.id] = "running";
          attempt++;
        }
        const ok = !fails || attempt > failuresBeforeSuccess;
        final[t.id] = now[t.id] = ok ? "success" : "failed";
        snap(`${t.id}: ${ok ? "success" : `failed after ${attempt} attempt${attempt > 1 ? "s" : ""}, alert sent`}`);
      }
    }
    const failed = Object.values(final).some((s) => s !== "success");
    snap(`scheduler: run ${failed ? "FAILED" : "succeeded"}`);
    frames.forEach((f, i) => {
      timers.current.push(setTimeout(() => {
        setStatus(f.s);
        setLog(frames.slice(0, i + 1).map((x) => x.line));
      }, i * 450));
    });
  }

  const select = "rounded-lg bg-paper px-2 py-1.5 text-sm text-ink ring-1 ring-ink/15";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-sm text-ink/70">
          <span className="mb-1 block text-xs text-ink/50">failure</span>
          <select value={kind} onChange={(e) => { setKind(e.target.value as typeof kind); onInteract(); }} className={select}>
            <option value="none">none</option>
            <option value="temporary">temporary (fails once)</option>
            <option value="permanent">permanent</option>
          </select>
        </label>
        <label className="text-sm text-ink/70">
          <span className="mb-1 block text-xs text-ink/50">in task</span>
          <select value={broken} onChange={(e) => { setBroken(e.target.value); onInteract(); }} className={select} disabled={kind === "none"}>
            {TASKS.map((t) => <option key={t.id} value={t.id}>{t.id}</option>)}
          </select>
        </label>
        <label className="text-sm text-ink/70">
          <span className="mb-1 block text-xs text-ink/50">retries: {retries}</span>
          <input type="range" min={0} max={3} value={retries} onChange={(e) => { setRetries(Number(e.target.value)); onInteract(); }} className="w-32 accent-[var(--color-lime-deep)]" />
        </label>
        <button type="button" onClick={run} className="rounded-xl bg-ink px-5 py-2 text-sm font-semibold text-paper">▶ Run the DAG</button>
      </div>

      <div className="overflow-x-auto">
        <div className="relative h-56 min-w-[640px] rounded-2xl bg-paper ring-1 ring-ink/10">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {TASKS.flatMap((t) => t.deps.map((d) => {
              const from = TASKS.find((x) => x.id === d)!;
              return <line key={d + t.id} x1={X(from.col)} y1={Y(from.row)} x2={X(t.col)} y2={Y(t.row)} className="stroke-ink/25" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />;
            }))}
          </svg>
          {TASKS.map((t) => {
            const s = status[t.id] ?? "queued";
            return (
              <div key={t.id} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-xl px-2.5 py-2 text-center font-mono text-[11px] font-semibold ring-1 transition-colors ${STYLE[s]}`} style={{ left: `${X(t.col)}%`, top: `${Y(t.row)}%` }}>
                {t.id}
                <span className="block text-[10px] font-normal opacity-70">{s.replace("_", " ")}</span>
              </div>
            );
          })}
        </div>
      </div>

      <pre ref={logRef} className="h-40 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-code p-4 font-mono text-xs leading-relaxed text-white/80">
        {log.length ? log.join("\n") : "# press Run to start the scheduler"}
      </pre>
    </div>
  );
}
