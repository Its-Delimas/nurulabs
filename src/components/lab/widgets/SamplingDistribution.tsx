"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import Slider from "./Slider";
import { sampleShare, TRUE_SHARE } from "./samplingPopulation";

const BINS = 40;

/** Draw many samples and watch their results pile up around the truth — or around the wrong value. */
export default function SamplingDistribution({ onInteract }: { onInteract: () => void }) {
  const [n, setN] = useState(50);
  const [urbanOnly, setUrbanOnly] = useState(false);
  const [results, setResults] = useState<number[]>([]);

  const draw = (k: number) => {
    setResults((r) => [...r, ...Array.from({ length: k }, () => sampleShare(n, urbanOnly))].slice(-2000));
    onInteract();
  };
  const reset = (fn: () => void) => { fn(); setResults([]); onInteract(); };

  const counts = Array(BINS).fill(0);
  results.forEach((x) => { counts[Math.min(BINS - 1, Math.floor(x * BINS))]++; });
  const peak = Math.max(1, ...counts);
  const mean = results.length ? results.reduce((s, x) => s + x, 0) / results.length : NaN;
  const sd = results.length > 1 ? Math.sqrt(results.reduce((s, x) => s + (x - mean) ** 2, 0) / (results.length - 1)) : NaN;
  const W = 520, H = 200;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full rounded-2xl bg-paper ring-1 ring-ink/10" role="img" aria-label="Histogram of sample results">
          {counts.map((c, i) => (
            <rect key={i} x={(i / BINS) * W + 1} y={H - (c / peak) * (H - 10)} width={W / BINS - 2} height={(c / peak) * (H - 10)} fill={urbanOnly ? "var(--color-danger)" : "var(--color-lime-deep)"} opacity={0.75} />
          ))}
          <line x1={TRUE_SHARE * W} x2={TRUE_SHARE * W} y1={0} y2={H} stroke="var(--color-ink)" strokeWidth={2} strokeDasharray="5 4" />
          <text x={TRUE_SHARE * W + 6} y={14} className="fill-ink text-[11px]">true share {Math.round(TRUE_SHARE * 100)}%</text>
          {[0, 25, 50, 75, 100].map((p) => <text key={p} x={(p / 100) * W} y={H + 16} textAnchor={p === 0 ? "start" : p === 100 ? "end" : "middle"} className="fill-ink/50 text-[10px]">{p}%</text>)}
        </svg>
        <p className="text-xs text-ink/55">Each bar counts samples whose share of households with electricity fell in that range.</p>
      </div>
      <div className="space-y-5">
        <Slider label="households per sample (n)" value={n} min={10} max={500} step={10} onChange={(v) => reset(() => setN(v))} />
        <label className="flex items-center gap-3 text-sm text-ink/70">
          <input type="checkbox" checked={urbanOnly} onChange={(e) => reset(() => setUrbanOnly(e.target.checked))} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
          Convenience sample: only urban households (easy to reach)
        </label>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => draw(1)} className="inline-flex items-center gap-1.5 rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink"><Shuffle size={14} /> 1 sample</button>
          <button type="button" onClick={() => draw(200)} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">200 samples</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10"><p className="text-xs text-ink/50">average of samples</p><p className="font-mono text-lg text-ink">{Number.isNaN(mean) ? "—" : `${(mean * 100).toFixed(1)}%`}</p></div>
          <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10"><p className="text-xs text-ink/50">spread (standard error)</p><p className="font-mono text-lg text-ink">{Number.isNaN(sd) ? "—" : `${(sd * 100).toFixed(1)} pts`}</p></div>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">{results.length} samples drawn from 5,000 illustrative households. Quadruple n and the spread halves. A biased sample stays wrong however big it gets.</p>
      </div>
    </div>
  );
}
