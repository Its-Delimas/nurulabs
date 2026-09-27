"use client";

import { useState } from "react";

// Malaria in the cleaned clinic records (illustrative), three ways.
const DATA = [
  { county: "Kakamega", count: 78, per100k: 4.18, share: 0.368 },
  { county: "Kisumu", count: 51, per100k: 4.41, share: 0.408 },
  { county: "Turkana", count: 34, per100k: 3.67, share: 0.386 },
  { county: "Nairobi", count: 23, per100k: 0.52, share: 0.039 },
  { county: "Mombasa", count: 20, per100k: 1.66, share: 0.146 },
  { county: "Nakuru", count: 17, per100k: 0.79, share: 0.07 },
];

const METRICS = {
  count: { label: "malaria visits", question: "Where do clinics see the most malaria visits?", fmt: (v: number) => String(v) },
  per100k: { label: "per 100,000 residents", question: "Relative to how many people live there?", fmt: (v: number) => v.toFixed(1) },
  share: { label: "share of all visits", question: "How much of the clinics' workload is malaria?", fmt: (v: number) => `${Math.round(v * 100)}%` },
} as const;

type Metric = keyof typeof METRICS;

/** The same data, three denominators, three different rankings. */
export default function RateExplorer({ onInteract }: { onInteract: () => void }) {
  const [metric, setMetric] = useState<Metric>("count");
  const sorted = [...DATA].sort((a, b) => b[metric] - a[metric]);
  const max = sorted[0][metric];

  return (
    <div className="space-y-6">
      <div className="inline-flex flex-wrap rounded-xl bg-ink/5 p-1">
        {(Object.keys(METRICS) as Metric[]).map((m) => (
          <button key={m} type="button" onClick={() => { setMetric(m); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${metric === m ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
            {METRICS[m].label}
          </button>
        ))}
      </div>
      <p className="font-display text-lg font-semibold text-ink">{METRICS[metric].question}</p>
      <ol className="space-y-2">
        {sorted.map((d, i) => (
          <li key={d.county} className="grid grid-cols-[1.5rem_6rem_1fr_4rem] items-center gap-3 text-sm">
            <span className="font-mono text-ink/40">{i + 1}</span>
            <span className="font-semibold text-ink">{d.county}</span>
            <span className="h-4 rounded-md bg-lime-deep transition-all duration-500" style={{ width: `${(d[metric] / max) * 100}%` }} />
            <span className="text-right font-mono text-ink/70">{METRICS[metric].fmt(d[metric])}</span>
          </li>
        ))}
      </ol>
      <p className="text-xs leading-relaxed text-ink/55">
        Illustrative records from three clinics per county. Rates use 2019 census populations — but three clinics don&apos;t serve a whole county, so even the rate needs care. The right number depends on the question.
      </p>
    </div>
  );
}
