"use client";

import { useState } from "react";

// The lab's survey: households sampled per county vs households in the population,
// and the share with electricity in each county's sample.
const COUNTIES = [
  { county: "Nairobi", N: 1072, n: 60, elec: 0.95 },
  { county: "Nakuru", N: 1199, n: 100, elec: 0.61 },
  { county: "Kakamega", N: 996, n: 100, elec: 0.46 },
  { county: "Mombasa", N: 630, n: 100, elec: 0.9 },
  { county: "Kisumu", N: 604, n: 150, elec: 0.633 },
  { county: "Turkana", N: 499, n: 250, elec: 0.384 },
];
const TRUTH = 0.674;
const totalN = COUNTIES.reduce((s, c) => s + c.N, 0);
const totaln = COUNTIES.reduce((s, c) => s + c.n, 0);

/** An oversampled survey, with and without design weights. */
export default function WeightingDemo({ onInteract }: { onInteract: () => void }) {
  const [weighted, setWeighted] = useState(false);
  const share = (c: (typeof COUNTIES)[number]) => (weighted ? c.N / totalN : c.n / totaln);
  const estimate = COUNTIES.reduce((s, c) => s + share(c) * c.elec, 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-2">
        <div className="grid grid-cols-[6rem_1fr_1fr_4rem] gap-3 text-xs font-semibold text-ink/45">
          <span>county</span><span>share of the estimate</span><span>share of all households</span><span className="text-right">electricity</span>
        </div>
        {COUNTIES.map((c) => (
          <div key={c.county} className="grid grid-cols-[6rem_1fr_1fr_4rem] items-center gap-3 text-sm">
            <span className="text-ink">{c.county}</span>
            <span className="h-4 rounded-sm bg-lime-deep transition-all duration-500" style={{ width: `${share(c) * 250}%` }} />
            <span className="h-4 rounded-sm bg-ink/20" style={{ width: `${(c.N / totalN) * 250}%` }} />
            <span className="text-right font-mono text-xs text-ink/70">{Math.round(c.elec * 100)}%</span>
          </div>
        ))}
        <p className="pt-2 text-xs text-ink/55">Turkana is 10% of households but {Math.round((250 / totaln) * 100)}% of the sample — it was oversampled on purpose, to get a precise Turkana estimate.</p>
      </div>
      <div className="space-y-4">
        <div className="inline-flex rounded-xl bg-ink/5 p-1">
          {[false, true].map((v) => (
            <button key={String(v)} type="button" onClick={() => { setWeighted(v); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${weighted === v ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
              {v ? "use design weights" : "every household counts once"}
            </button>
          ))}
        </div>
        <div className={`rounded-2xl p-5 ${Math.abs(estimate - TRUTH) < 0.015 ? "bg-lime-soft ring-1 ring-lime-deep/20" : "bg-danger-soft"}`}>
          <p className="text-xs text-ink/55">estimated share with electricity</p>
          <p className="font-display text-3xl font-semibold text-ink">{(estimate * 100).toFixed(1)}%</p>
          <p className="mt-1 text-xs text-ink/55">true value in the population: {(TRUTH * 100).toFixed(1)}%</p>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">Each household&apos;s weight is how many households it stands for: county households ÷ households sampled there. Weighting gives each county its true share again.</p>
      </div>
    </div>
  );
}
