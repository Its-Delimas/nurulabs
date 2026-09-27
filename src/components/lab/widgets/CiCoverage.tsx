"use client";

import { useState } from "react";
import Slider from "./Slider";
import { sampleShare, TRUE_SHARE } from "./samplingPopulation";

const Z: Record<number, number> = { 80: 1.2816, 90: 1.6449, 95: 1.96, 99: 2.5758 };
const LEVELS = [80, 90, 95, 99];

function intervals(k: number, n: number, level: number) {
  return Array.from({ length: k }, () => {
    const p = sampleShare(n);
    const half = Z[level] * Math.sqrt((p * (1 - p)) / n);
    return { lo: p - half, hi: p + half, p };
  });
}

/** Forty surveys, forty intervals: how many catch the true value? */
export default function CiCoverage({ onInteract }: { onInteract: () => void }) {
  const [n, setN] = useState(100);
  const [level, setLevel] = useState(95);
  const [ivs, setIvs] = useState(() => intervals(40, 100, 95));
  const redo = (nn = n, ll = level) => { setIvs(intervals(40, nn, ll)); onInteract(); };
  const covered = ivs.filter((iv) => iv.lo <= TRUE_SHARE && TRUE_SHARE <= iv.hi).length;
  const W = 520, lo = 0.4, hi = 0.95, x = (v: number) => ((Math.min(hi, Math.max(lo, v)) - lo) / (hi - lo)) * W;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <svg viewBox={`0 0 ${W} ${ivs.length * 7 + 26}`} className="w-full rounded-2xl bg-paper ring-1 ring-ink/10" role="img" aria-label="Confidence intervals from 40 samples">
        <line x1={x(TRUE_SHARE)} x2={x(TRUE_SHARE)} y1={0} y2={ivs.length * 7 + 6} stroke="var(--color-ink)" strokeWidth={1.5} strokeDasharray="4 3" />
        {ivs.map((iv, i) => {
          const hit = iv.lo <= TRUE_SHARE && TRUE_SHARE <= iv.hi;
          return (
            <g key={i}>
              <line x1={x(iv.lo)} x2={x(iv.hi)} y1={i * 7 + 6} y2={i * 7 + 6} stroke={hit ? "var(--color-lime-deep)" : "var(--color-danger)"} strokeWidth={3} strokeLinecap="round" />
              <circle cx={x(iv.p)} cy={i * 7 + 6} r={2} fill="var(--color-ink)" />
            </g>
          );
        })}
        {[50, 60, 70, 80, 90].map((p) => <text key={p} x={x(p / 100)} y={ivs.length * 7 + 20} textAnchor="middle" className="fill-ink/50 text-[10px]">{p}%</text>)}
      </svg>
      <div className="space-y-5">
        <Slider label="households per survey (n)" value={n} min={20} max={1000} step={20} onChange={(v) => { setN(v); redo(v, level); }} />
        <div>
          <p className="text-sm font-medium text-ink/70">confidence level</p>
          <div className="mt-2 inline-flex rounded-xl bg-ink/5 p-1">
            {LEVELS.map((l) => (
              <button key={l} type="button" onClick={() => { setLevel(l); redo(n, l); }} className={`rounded-lg px-3 py-1.5 font-mono text-sm font-semibold ${level === l ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>{l}%</button>
            ))}
          </div>
        </div>
        <button type="button" onClick={() => redo()} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">Run 40 new surveys</button>
        <div className={`rounded-2xl p-4 ${covered / ivs.length >= level / 100 - 0.05 ? "bg-lime-soft ring-1 ring-lime-deep/20" : "bg-danger-soft"}`}>
          <p className="text-xs text-ink/55">intervals that contain the true value</p>
          <p className="font-display text-2xl font-semibold text-ink">{covered} of {ivs.length}</p>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">The dashed line is the true share ({Math.round(TRUE_SHARE * 100)}%). Each bar is one survey&apos;s interval. &ldquo;95% confidence&rdquo; describes the method: about 95 in 100 such intervals catch the truth. Higher confidence means wider bars; bigger samples mean narrower ones.</p>
      </div>
    </div>
  );
}
