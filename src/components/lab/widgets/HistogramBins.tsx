"use client";

import { useMemo, useState } from "react";
import { APPLICANTS } from "@/lib/curriculum/data/loan-model";
import Slider from "./Slider";

const incomes = APPLICANTS.map((a) => a.monthly_income_ksh);
const sorted = [...incomes].sort((a, b) => a - b);
const MEAN = incomes.reduce((s, x) => s + x, 0) / incomes.length;
const MEDIAN = (sorted[299] + sorted[300]) / 2;

/** Same 600 incomes, different bins and scales: what does the shape really look like? */
export default function HistogramBins({ onInteract }: { onInteract: () => void }) {
  const [bins, setBins] = useState(20);
  const [log, setLog] = useState(false);
  const f = (x: number) => (log ? Math.log10(x) : x);
  const lo = f(sorted[0]), hi = f(sorted[sorted.length - 1]);

  const counts = useMemo(() => {
    const c = Array(bins).fill(0);
    incomes.forEach((x) => { c[Math.min(bins - 1, Math.floor(((f(x) - lo) / (hi - lo)) * bins))]++; });
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bins, log]);

  const W = 520, H = 220, peak = Math.max(...counts);
  const xOf = (v: number) => ((f(v) - lo) / (hi - lo)) * W;
  const tick = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v));
  const ticks = log ? [5000, 10000, 20000, 50000, 100000] : [0, 25000, 50000, 75000, 100000, 125000];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full rounded-2xl bg-paper ring-1 ring-ink/10" role="img" aria-label="Histogram of monthly incomes">
        {counts.map((c, i) => (
          <rect key={i} x={(i / bins) * W + 1} y={H - (c / peak) * (H - 12)} width={W / bins - 2} height={(c / peak) * (H - 12)} fill="var(--color-ink)" opacity={0.25} />
        ))}
        <line x1={xOf(MEDIAN)} x2={xOf(MEDIAN)} y1={0} y2={H} stroke="var(--color-lime-deep)" strokeWidth={3} />
        <line x1={xOf(MEAN)} x2={xOf(MEAN)} y1={0} y2={H} stroke="var(--color-danger)" strokeWidth={3} strokeDasharray="6 4" />
        {ticks.filter((t) => t >= sorted[0] && t <= sorted[sorted.length - 1]).map((t) => (
          <text key={t} x={xOf(t)} y={H + 16} textAnchor="middle" className="fill-ink/50 text-[10px]">{tick(t)}</text>
        ))}
      </svg>
      <div className="space-y-5">
        <Slider label="number of bins" value={bins} min={4} max={60} onChange={(v) => { setBins(v); onInteract(); }} />
        <label className="flex items-center gap-3 text-sm text-ink/70">
          <input type="checkbox" checked={log} onChange={(e) => { setLog(e.target.checked); onInteract(); }} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
          Log scale for income
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-lime-soft p-4 ring-1 ring-lime-deep/20"><p className="text-xs text-ink/55">median</p><p className="font-mono text-lg text-ink">{Math.round(MEDIAN).toLocaleString()}</p></div>
          <div className="rounded-2xl bg-danger-soft p-4"><p className="text-xs text-ink/55">mean (dashed)</p><p className="font-mono text-lg text-ink">{Math.round(MEAN).toLocaleString()}</p></div>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">
          Recorded monthly incomes (KSh) of 600 illustrative loan applicants. A few high earners stretch the right tail and pull the mean above the median. Too few bins hide the shape; too many turn it into noise. On a log scale the long tail becomes a readable hump.
        </p>
      </div>
    </div>
  );
}
