"use client";

import { useState } from "react";

type Mode = "type1" | "type2";

// Totals from the lab's mobile-money export (KSh).
const SALES = {
  AG003: { before: 99150, after: 81610, change: "1 Jul" },
  AG010: { before: 345730, after: 178800, change: "1 Sep" },
};

const DIM: Record<Mode, string[][]> = {
  type1: [
    ["3", "AG003", "CBD Mega Agency", "CBD", "—", "—"],
    ["10", "AG010", "Mumias Agency", "Kakamega", "—", "—"],
  ],
  type2: [
    ["3", "AG003", "CBD Traders", "CBD", "2024-01-01", "2024-07-01"],
    ["4", "AG003", "CBD Mega Agency", "CBD", "2024-07-01", "9999-12-31"],
    ["11", "AG010", "Mumias Agency", "Mumias", "2024-01-01", "2024-09-01"],
    ["12", "AG010", "Mumias Agency", "Kakamega", "2024-09-01", "9999-12-31"],
  ],
};

/** SCD type 1 (overwrite) vs type 2 (keep history), and what reports then say. */
export default function ScdHistory({ onInteract }: { onInteract: () => void }) {
  const [mode, setMode] = useState<Mode>("type1");
  const k = (n: number) => `KSh ${n.toLocaleString()}`;

  const report = mode === "type1"
    ? [
        ["sales by agent name", "CBD Mega Agency", k(SALES.AG003.before + SALES.AG003.after)],
        ["sales by agent town", "Kakamega (AG010)", k(SALES.AG010.before + SALES.AG010.after)],
      ]
    : [
        ["sales by agent name", "CBD Traders", k(SALES.AG003.before)],
        ["", "CBD Mega Agency", k(SALES.AG003.after)],
        ["sales by agent town", "Mumias (AG010)", k(SALES.AG010.before)],
        ["", "Kakamega (AG010)", k(SALES.AG010.after)],
      ];

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-xl bg-ink/5 p-1">
        {(["type1", "type2"] as Mode[]).map((m) => (
          <button key={m} type="button" onClick={() => { setMode(m); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${mode === m ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
            {m === "type1" ? "SCD type 1: overwrite" : "SCD type 2: keep history"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold text-ink">dim_agent (AG003 and AG010)</p>
          <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
            <table className="w-full font-mono text-xs">
              <thead>
                <tr className="text-left text-ink/45">
                  {["agent_key", "agent_code", "agent_name", "agent_town", "valid_from", "valid_to"].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {DIM[mode].map((r) => (
                  <tr key={r[0]} className="border-t border-ink/5">
                    {r.map((c, i) => <td key={i} className={`px-3 py-1.5 ${i === 0 ? "text-lime-deep" : ""}`}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-ink/55">Changes this year: AG003 renamed on {SALES.AG003.change}; AG010 moved from Mumias to Kakamega on {SALES.AG010.change}.</p>
        </div>

        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold text-ink">The 2024 report, run in December</p>
          <div className="rounded-2xl bg-paper ring-1 ring-ink/10">
            {report.map(([q, label, value], i) => (
              <div key={i} className={`flex items-baseline justify-between gap-3 px-4 py-2.5 ${i ? "border-t border-ink/5" : ""}`}>
                <div>
                  {q && <p className="text-[11px] text-ink/45">{q}</p>}
                  <p className="text-sm text-ink">{label}</p>
                </div>
                <p className="font-mono text-sm text-ink">{value}</p>
              </div>
            ))}
          </div>
          <p className={`rounded-xl p-3 text-xs leading-relaxed ${mode === "type1" ? "bg-danger-soft text-danger" : "bg-lime-soft text-ink ring-1 ring-lime-deep/20"}`}>
            {mode === "type1"
              ? "History rewritten: eight months of Mumias sales now count as Kakamega's, and AG003's first-half sales appear under a name it didn't have yet."
              : "Each transaction joins to the version valid on its date, so the past stays as it was."}
          </p>
        </div>
      </div>
    </div>
  );
}
