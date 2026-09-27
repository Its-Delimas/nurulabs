"use client";

import { useState } from "react";

// Anscombe (1973): four datasets with near-identical summary statistics.
const X = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
const SETS: { name: string; x: number[]; y: number[] }[] = [
  { name: "I", x: X, y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68] },
  { name: "II", x: X, y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.1, 6.13, 3.1, 9.13, 7.26, 4.74] },
  { name: "III", x: X, y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73] },
  { name: "IV", x: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.5, 5.56, 7.91, 6.89] },
];

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
function corr(x: number[], y: number[]) {
  const mx = mean(x), my = mean(y);
  let sxy = 0, sxx = 0, syy = 0;
  x.forEach((xi, i) => { sxy += (xi - mx) * (y[i] - my); sxx += (xi - mx) ** 2; syy += (y[i] - my) ** 2; });
  return sxy / Math.sqrt(sxx * syy);
}

/** Four datasets, one set of statistics — until you plot them. */
export default function AnscombeQuartet({ onInteract }: { onInteract: () => void }) {
  const [i, setI] = useState(0);
  const [plotted, setPlotted] = useState(false);
  const d = SETS[i];
  const W = 360, H = 260, sx = (v: number) => ((v - 2) / 18) * W, sy = (v: number) => H - ((v - 2) / 12) * H;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="inline-flex rounded-xl bg-ink/5 p-1">
          {SETS.map((s, k) => (
            <button key={s.name} type="button" onClick={() => { setI(k); onInteract(); }} className={`rounded-lg px-4 py-1.5 font-mono text-sm font-semibold ${i === k ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
              {s.name}
            </button>
          ))}
        </div>
        <table className="w-full rounded-2xl bg-paper font-mono text-sm ring-1 ring-ink/10">
          <tbody>
            {[
              ["mean of x", mean(d.x).toFixed(2)],
              ["mean of y", mean(d.y).toFixed(2)],
              ["correlation", corr(d.x, d.y).toFixed(2)],
              ["best-fit line", "y = 3.00 + 0.50x"],
            ].map(([k, v]) => (
              <tr key={k} className="border-t border-ink/5 first:border-0"><td className="px-4 py-2 text-ink/55">{k}</td><td className="px-4 py-2 text-right text-ink">{v}</td></tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={() => { setPlotted(true); onInteract(); }} disabled={plotted} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper disabled:opacity-40">
          {plotted ? "Plotted" : "Now plot it"}
        </button>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-2xl bg-paper ring-1 ring-ink/10" role="img" aria-label={`Scatter plot of dataset ${d.name}`}>
        {plotted ? (
          <>
            <line x1={sx(2)} y1={sy(3 + 0.5 * 2)} x2={sx(20)} y2={sy(3 + 0.5 * 20)} stroke="var(--color-lime-deep)" strokeWidth={2} />
            {d.x.map((x, k) => <circle key={k} cx={sx(x)} cy={sy(d.y[k])} r={6} fill="var(--color-ink)" opacity={0.75} />)}
          </>
        ) : (
          <text x={W / 2} y={H / 2} textAnchor="middle" className="fill-ink/40 text-sm">The numbers look the same. Do the data?</text>
        )}
      </svg>
    </div>
  );
}
