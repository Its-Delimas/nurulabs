"use client";

import { useMemo, useState } from "react";
import Slider from "./Slider";

const BASE = 0.175; // control group's saving rate in the lab's trial

function binomial(n: number, p: number) {
  // Normal approximation is plenty for n ≥ 100.
  const mean = n * p, sd = Math.sqrt(n * p * (1 - p));
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.max(0, Math.round(mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)));
}

function experiment(n: number, lift: number) {
  const a = binomial(n, BASE) / n, b = binomial(n, BASE + lift) / n;
  const pooled = (a + b) / 2;
  const se = Math.sqrt((2 * pooled * (1 - pooled)) / n);
  return { diff: b - a, significant: Math.abs((b - a) / se) > 1.96 };
}

/** How big must an experiment be to detect a real effect? Run it 300 times and see. */
export default function AbSimulator({ onInteract }: { onInteract: () => void }) {
  const [lift, setLift] = useState(3);
  const [n, setN] = useState(500);
  const [seed, setSeed] = useState(0);
  const runs = useMemo(() => Array.from({ length: 300 }, () => experiment(n, lift / 100)), [n, lift, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const power = runs.filter((r) => r.significant).length / runs.length;
  const W = 520, H = 160, lo = -0.08, hi = 0.14, BINS = 44;
  const counts = Array(BINS).fill(0);
  runs.forEach((r) => { const i = Math.floor(((r.diff - lo) / (hi - lo)) * BINS); if (i >= 0 && i < BINS) counts[i]++; });
  const peak = Math.max(1, ...counts);
  const x = (v: number) => ((v - lo) / (hi - lo)) * W;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full rounded-2xl bg-paper ring-1 ring-ink/10" role="img" aria-label="Observed lifts from 300 simulated experiments">
          {counts.map((c, i) => (
            <rect key={i} x={(i / BINS) * W + 1} y={H - (c / peak) * (H - 8)} width={W / BINS - 2} height={(c / peak) * (H - 8)} fill="var(--color-ink)" opacity={0.3} />
          ))}
          <line x1={x(0)} x2={x(0)} y1={0} y2={H} stroke="var(--color-danger)" strokeWidth={1.5} strokeDasharray="4 3" />
          <line x1={x(lift / 100)} x2={x(lift / 100)} y1={0} y2={H} stroke="var(--color-lime-deep)" strokeWidth={2.5} />
          {[-5, 0, 5, 10].map((p) => <text key={p} x={x(p / 100)} y={H + 16} textAnchor="middle" className="fill-ink/50 text-[10px]">{p > 0 ? "+" : ""}{p} pts</text>)}
        </svg>
        <p className="text-xs text-ink/55">Observed lift in 300 repeats of the same experiment. Green: the true lift. Red: no effect.</p>
      </div>
      <div className="space-y-5">
        <Slider label="true lift from the reminder" value={lift} min={0} max={8} step={0.5} format={(v) => `+${v} pts`} onChange={(v) => { setLift(v); onInteract(); }} />
        <Slider label="users per group" value={n} min={100} max={5000} step={100} onChange={(v) => { setN(v); onInteract(); }} />
        <button type="button" onClick={() => { setSeed((s) => s + 1); onInteract(); }} className="rounded-md border border-ink/15 px-4 py-2 text-sm font-semibold text-ink">Run 300 more</button>
        <div className={`rounded-2xl p-4 ${power >= 0.8 ? "bg-lime-soft ring-1 ring-lime-deep/20" : "bg-danger-soft"}`}>
          <p className="text-xs text-ink/55">{lift === 0 ? "false alarms (should be ~5%)" : "experiments that detect the effect (power)"}</p>
          <p className="font-display text-2xl font-semibold text-ink">{Math.round(power * 100)}%</p>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">Baseline saving rate {BASE * 100}%. Teams usually want at least 80% power before running a test. Small effects need surprisingly many users.</p>
      </div>
    </div>
  );
}
