"use client";

import { useState } from "react";
import Slider from "./Slider";

// A seeded random generator (mulberry32), so a fixed seed really repeats.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Simulated evaluation: a model that is right 85% of the time, scored on a random test set.
function evaluate(seed: number, n: number, trueAcc: number) {
  const r = rng(seed);
  let correct = 0;
  for (let i = 0; i < n; i++) if (r() < trueAcc) correct++;
  return correct / n;
}

/** Same model, different random splits: how much does the score move? */
export default function SeedExplorer({ onInteract }: { onInteract: () => void }) {
  const [fixed, setFixed] = useState(true);
  const [n, setN] = useState(200);
  const [runs, setRuns] = useState<{ a: number; b: number }[]>([]);
  const [counter, setCounter] = useState(1);

  const run = () => {
    const seed = fixed ? 42 : 1000 + counter * 7919;
    setCounter((c) => c + 1);
    // Model B is genuinely 1 point better than model A.
    setRuns((rs) => [...rs, { a: evaluate(seed, n, 0.85), b: evaluate(seed + 1, n, 0.86) }].slice(-12));
    onInteract();
  };

  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const sd = (xs: number[]) => (xs.length > 1 ? Math.sqrt(xs.reduce((s, x) => s + (x - mean(xs)) ** 2, 0) / (xs.length - 1)) : 0);
  const as = runs.map((r) => r.a), bs = runs.map((r) => r.b);
  const bWins = runs.filter((r) => r.b > r.a).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-5">
        <div className="inline-flex rounded-xl bg-ink/5 p-1">
          {[true, false].map((v) => (
            <button key={String(v)} type="button" onClick={() => { setFixed(v); setRuns([]); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${fixed === v ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
              {v ? "fixed seed (42)" : "new random split each run"}
            </button>
          ))}
        </div>
        <Slider label="test-set size" value={n} min={50} max={2000} step={50} onChange={(v) => { setN(v); setRuns([]); onInteract(); }} />
        <button type="button" onClick={run} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">Train &amp; evaluate both models</button>
        <p className="text-xs leading-relaxed text-ink/55">Simulated evaluations: model B is truly 1 point more accurate than model A (86% vs 85%). Each run scores both on a random test set.</p>
      </div>
      <div className="space-y-3">
        <div className="overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/10">
          <table className="w-full font-mono text-xs">
            <thead><tr className="text-left text-ink/45"><th className="px-4 py-2">run</th><th className="px-4 py-2">model A</th><th className="px-4 py-2">model B</th><th className="px-4 py-2">winner</th></tr></thead>
            <tbody>
              {runs.map((r, k) => (
                <tr key={k} className="border-t border-ink/5"><td className="px-4 py-1.5 text-ink/50">{k + 1}</td><td className="px-4 py-1.5">{(r.a * 100).toFixed(1)}%</td><td className="px-4 py-1.5">{(r.b * 100).toFixed(1)}%</td><td className={`px-4 py-1.5 ${r.b > r.a ? "text-lime-deep" : "text-danger"}`}>{r.b > r.a ? "B" : r.b < r.a ? "A" : "tie"}</td></tr>
              ))}
              {!runs.length && <tr><td colSpan={4} className="px-4 py-6 text-center text-ink/40">No runs yet</td></tr>}
            </tbody>
          </table>
        </div>
        {runs.length > 1 && (
          <p className="rounded-2xl bg-cream p-4 text-sm text-ink/75">
            A: {(mean(as) * 100).toFixed(1)}% ± {(sd(as) * 100).toFixed(1)} · B: {(mean(bs) * 100).toFixed(1)}% ± {(sd(bs) * 100).toFixed(1)} · B won {bWins} of {runs.length} runs.
            {fixed ? " Same seed, same numbers every time: reproducible — but one split is one sample." : " The run-to-run spread is bigger than the real difference, so a single run can crown the wrong model."}
          </p>
        )}
      </div>
    </div>
  );
}
