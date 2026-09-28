"use client";

import { useState } from "react";

const ROWS = [
  { agent: "AG004", month: "Jan", total: 19880 },
  { agent: "AG004", month: "Feb", total: 31800 },
  { agent: "AG004", month: "Mar", total: 15230 },
  { agent: "AG005", month: "Jan", total: 22100 },
  { agent: "AG005", month: "Feb", total: 18400 },
  { agent: "AG005", month: "Mar", total: 27650 },
];

const FNS = {
  running: { label: "SUM(total) OVER (… ORDER BY month)", title: "running total" },
  rank: { label: "RANK() OVER (… ORDER BY total DESC)", title: "rank" },
  lag: { label: "LAG(total) OVER (… ORDER BY month)", title: "previous month" },
} as const;
type Fn = keyof typeof FNS;

/** Window functions add a calculated column without collapsing the rows. */
export default function WindowExplorer({ onInteract }: { onInteract: () => void }) {
  const [fn, setFn] = useState<Fn>("running");
  const [partition, setPartition] = useState(true);

  const groups = partition ? ["AG004", "AG005"] : ["all"];
  const out = new Map<number, string>();
  for (const g of groups) {
    const idx = ROWS.map((r, i) => ({ r, i })).filter(({ r }) => g === "all" || r.agent === g);
    if (fn === "running") { let s = 0; idx.forEach(({ r, i }) => { s += r.total; out.set(i, s.toLocaleString()); }); }
    if (fn === "lag") idx.forEach(({ i }, k) => out.set(i, k ? idx[k - 1].r.total.toLocaleString() : "NULL"));
    if (fn === "rank") [...idx].sort((a, b) => b.r.total - a.r.total).forEach(({ i }, k) => out.set(i, String(k + 1)));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(FNS) as Fn[]).map((f) => (
          <button key={f} type="button" onClick={() => { setFn(f); onInteract(); }} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${fn === f ? "bg-ink text-paper ring-ink" : "text-ink/60 ring-ink/15"}`}>{FNS[f].title}</button>
        ))}
        <label className="ml-2 flex items-center gap-2 text-sm text-ink/70">
          <input type="checkbox" checked={partition} onChange={(e) => { setPartition(e.target.checked); onInteract(); }} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
          PARTITION BY agent
        </label>
      </div>
      <code className="block rounded-xl bg-code px-4 py-3 font-mono text-xs text-white/85">{FNS[fn].label.replace(partition ? "…" : "… ", partition ? "PARTITION BY agent" : "")}</code>
      <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
        <table className="w-full font-mono text-sm">
          <thead><tr className="text-left text-xs text-ink/45"><th className="px-4 py-2">agent</th><th className="px-4 py-2">month</th><th className="px-4 py-2">total</th><th className="px-4 py-2 text-lime-deep">{FNS[fn].title}</th></tr></thead>
          <tbody>{ROWS.map((r, i) => (
            <tr key={i} className={`border-t border-ink/5 ${partition && i === 3 ? "border-t-2 border-t-ink/20" : ""}`}>
              <td className="px-4 py-1.5">{r.agent}</td><td className="px-4 py-1.5">{r.month}</td><td className="px-4 py-1.5">{r.total.toLocaleString()}</td>
              <td className="px-4 py-1.5 font-semibold text-lime-deep">{out.get(i)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-ink/55">GROUP BY would squash these six rows into one per agent. A window keeps every row and computes over a &ldquo;window&rdquo; of related rows. PARTITION BY restarts the calculation for each agent.</p>
    </div>
  );
}
