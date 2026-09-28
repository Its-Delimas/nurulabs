"use client";

import { useState } from "react";

// A small illustrative sheet of quarterly clinic figures.
const SHEET = [
  { id: "C07", county: "Kakamega", quarter: "Q1", malaria: 5 },
  { id: "C13", county: "Kisumu", quarter: "Q1", malaria: 1 },
  { id: "C07", county: "Kakamega", quarter: "Q2", malaria: 9 },
  { id: "C13", county: "Kisumu", quarter: "Q2", malaria: 7 },
  { id: "C16", county: "Turkana", quarter: "Q2", malaria: 6 },
  { id: "C16", county: "Turkana", quarter: "Q1", malaria: 1 },
];
const CLINIC_NAMES: Record<string, string> = { C07: "Mumias Hospital", C13: "Kondele Hospital", C16: "Lodwar Hospital" };

const TASKS = {
  sumifs: {
    label: "Total for one group",
    excel: '=SUMIFS(D:D, B:B, "Kisumu")',
    pandas: 'df.loc[df["county"] == "Kisumu", "malaria"].sum()',
    result: () => [["Kisumu", String(SHEET.filter((r) => r.county === "Kisumu").reduce((s, r) => s + r.malaria, 0))]],
    head: ["county", "malaria"],
  },
  pivot: {
    label: "PivotTable",
    excel: "Insert → PivotTable: Rows = county, Columns = quarter, Values = Sum of malaria",
    pandas: 'df.pivot_table(index="county", columns="quarter", values="malaria", aggfunc="sum")',
    result: () => ["Kakamega", "Kisumu", "Turkana"].map((c) => [c, ...["Q1", "Q2"].map((q) => String(SHEET.filter((r) => r.county === c && r.quarter === q).reduce((s, r) => s + r.malaria, 0)))]),
    head: ["county", "Q1", "Q2"],
  },
  lookup: {
    label: "XLOOKUP / VLOOKUP",
    excel: "=XLOOKUP(A2, Clinics!A:A, Clinics!B:B)",
    pandas: 'df.merge(clinics, on="id", how="left")',
    result: () => SHEET.slice(0, 4).map((r) => [r.id, r.quarter, CLINIC_NAMES[r.id]]),
    head: ["id", "quarter", "clinic_name"],
  },
  filter: {
    label: "Filter & sort",
    excel: "Data → Filter: quarter = Q2, then Sort malaria Largest to Smallest",
    pandas: 'df[df["quarter"] == "Q2"].sort_values("malaria", ascending=False)',
    result: () => SHEET.filter((r) => r.quarter === "Q2").sort((a, b) => b.malaria - a.malaria).map((r) => [r.id, r.county, String(r.malaria)]),
    head: ["id", "county", "malaria"],
  },
  ifs: {
    label: "IF formula column",
    excel: '=IF(D2>=5, "high", "low")   (then fill down)',
    pandas: 'df["level"] = np.where(df["malaria"] >= 5, "high", "low")',
    result: () => SHEET.map((r) => [r.id, r.quarter, String(r.malaria), r.malaria >= 5 ? "high" : "low"]),
    head: ["id", "quarter", "malaria", "level"],
  },
} as const;

type Task = keyof typeof TASKS;

/** Every everyday Excel move has a pandas equivalent — see them side by side. */
export default function ExcelToPandas({ onInteract }: { onInteract: () => void }) {
  const [task, setTask] = useState<Task>("sumifs");
  const t = TASKS[task];
  const rows = t.result();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TASKS) as Task[]).map((k) => (
          <button key={k} type="button" onClick={() => { setTask(k); onInteract(); }} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${task === k ? "bg-ink text-paper ring-ink" : "text-ink/60 ring-ink/15"}`}>
            {TASKS[k].label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
          <p className="text-xs font-semibold text-ink/50">In Excel / Google Sheets</p>
          <code className="mt-2 block font-mono text-sm text-ink">{t.excel}</code>
        </div>
        <div className="rounded-2xl bg-code p-4">
          <p className="text-xs font-semibold text-white/50">In pandas</p>
          <code className="mt-2 block font-mono text-sm text-white/90">{t.pandas}</code>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
        <table className="w-full font-mono text-xs">
          <thead><tr>{t.head.map((h) => <th key={h} className="px-4 py-2 text-left font-semibold text-ink/45">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-ink/5">{r.map((c, j) => <td key={j} className="px-4 py-1.5 text-ink/80">{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-ink/55">Same result either way. Excel is visible and familiar to colleagues; code is repeatable, handles millions of rows, and keeps a record of every step. Most data teams use both.</p>
    </div>
  );
}
