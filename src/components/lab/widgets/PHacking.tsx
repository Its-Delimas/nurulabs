"use client";

import { useState } from "react";

const SUBGROUPS = [
  "women", "men", "under 25", "25–40", "over 40", "urban", "rural", "Nairobi", "Kisumu", "Mombasa",
  "Nakuru", "Kakamega", "Turkana", "first-time users", "long-time users", "Android", "feature phone", "weekday sign-ups", "weekend sign-ups", "students",
];

function normal() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Two-sided p-value from a z statistic (normal approximation). */
function pValue(z: number) {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const tail = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return 2 * tail;
}

// In every subgroup the reminder has NO real effect: both groups are drawn from the same distribution.
function runTests() {
  return SUBGROUPS.map((name) => {
    const n = 60;
    let a = 0, b = 0;
    for (let i = 0; i < n; i++) { a += normal(); b += normal(); }
    const z = (b / n - a / n) / Math.sqrt(2 / n);
    return { name, p: pValue(z) };
  });
}

/** Test enough subgroups and something will look "significant" — even when nothing is going on. */
export default function PHacking({ onInteract }: { onInteract: () => void }) {
  const [tests, setTests] = useState(runTests);
  const [bonferroni, setBonferroni] = useState(false);
  const [runs, setRuns] = useState(1);
  const cutoff = bonferroni ? 0.05 / tests.length : 0.05;
  const hits = tests.filter((t) => t.p < cutoff);

  return (
    <div className="space-y-5">
      <p className="text-sm text-ink/65">A savings reminder that does <strong>nothing</strong>, tested separately in 20 customer subgroups. Bars show each p-value; anything left of the line is declared &ldquo;significant&rdquo;.</p>
      <div className="grid gap-1.5">
        {tests.map((t) => (
          <div key={t.name} className="grid grid-cols-[8.5rem_1fr_3.5rem] items-center gap-3 text-xs">
            <span className="truncate text-ink/70">{t.name}</span>
            <span className="relative h-3 rounded-full bg-ink/5">
              <span className="absolute top-0 h-3 w-px bg-ink" style={{ left: `${(cutoff / 1) * 100}%` }} />
              <span className={`absolute top-0 h-3 rounded-full ${t.p < cutoff ? "bg-danger" : "bg-ink/25"}`} style={{ width: `${Math.max(1, t.p * 100)}%` }} />
            </span>
            <span className={`text-right font-mono ${t.p < cutoff ? "font-semibold text-danger" : "text-ink/50"}`}>{t.p.toFixed(3)}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => { setTests(runTests()); setRuns((r) => r + 1); onInteract(); }} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-paper">Run the 20 tests again</button>
        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={bonferroni} onChange={(e) => { setBonferroni(e.target.checked); onInteract(); }} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
          Correct for 20 tests (Bonferroni: p &lt; 0.05 ÷ 20)
        </label>
      </div>
      <p className={`rounded-2xl p-4 text-sm ${hits.length ? "bg-danger-soft text-ink" : "bg-lime-soft text-ink ring-1 ring-lime-deep/20"}`}>
        {hits.length
          ? `Run ${runs}: ${hits.length} "significant" finding${hits.length > 1 ? "s" : ""} (${hits.map((h) => h.name).join(", ")}) — all false alarms.`
          : `Run ${runs}: no false alarms this time.`}{" "}
        With 20 tests at p &lt; 0.05, you expect about one by pure chance.
      </p>
    </div>
  );
}
