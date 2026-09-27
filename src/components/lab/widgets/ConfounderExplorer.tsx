"use client";

import { useState } from "react";

// Mean exam score and number of students, from the lab's students.csv.
const GROUPS = [
  { band: "low income", none: { mean: 48.9, n: 497 }, tuition: { mean: 50.2, n: 55 } },
  { band: "middle income", none: { mean: 58.5, n: 301 }, tuition: { mean: 61.0, n: 150 } },
  { band: "high income", none: { mean: 68.1, n: 72 }, tuition: { mean: 70.3, n: 125 } },
];
const NAIVE = { none: 53.8, tuition: 62.7 };

/** Does private tuition raise scores by 9 points — or do richer families simply buy more tuition? */
export default function ConfounderExplorer({ onInteract }: { onInteract: () => void }) {
  const [split, setSplit] = useState(false);
  const max = 75, min = 40;
  const bar = (label: string, mean: number, n: number, tuition: boolean) => (
    <div className="grid grid-cols-[6.5rem_1fr_5.5rem] items-center gap-3 text-sm">
      <span className="text-ink/60">{label}</span>
      <span className="h-5 rounded-sm" style={{ width: `${((mean - min) / (max - min)) * 100}%`, background: tuition ? "var(--color-lime-deep)" : "color-mix(in srgb, var(--color-ink) 30%, transparent)" }} />
      <span className="font-mono text-xs text-ink/70">{mean.toFixed(1)} <span className="text-ink/40">n={n}</span></span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-xl bg-ink/5 p-1">
        {[false, true].map((v) => (
          <button key={String(v)} type="button" onClick={() => { setSplit(v); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${split === v ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
            {v ? "compare within income bands" : "all students together"}
          </button>
        ))}
      </div>
      {!split ? (
        <div className="space-y-2 rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
          {bar("no tuition", NAIVE.none, 870, false)}
          {bar("tuition", NAIVE.tuition, 330, true)}
          <p className="pt-2 text-sm font-semibold text-ink">Gap: {(NAIVE.tuition - NAIVE.none).toFixed(1)} points</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {GROUPS.map((g) => (
            <div key={g.band} className="space-y-2 rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
              <p className="text-xs font-semibold text-ink/50">{g.band}</p>
              {bar("no tuition", g.none.mean, g.none.n, false)}
              {bar("tuition", g.tuition.mean, g.tuition.n, true)}
              <p className="text-sm font-semibold text-ink">Gap: {(g.tuition.mean - g.none.mean).toFixed(1)}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs leading-relaxed text-ink/55">
        Illustrative scores of 1,200 students (axis starts at 40). High-income families are far more likely to pay for tuition <em>and</em> their children score higher for many other reasons. Income is a <strong>confounder</strong>: comparing like with like shrinks the gap from about 9 points to about 2.
      </p>
    </div>
  );
}
