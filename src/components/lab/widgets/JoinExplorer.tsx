"use client";

import { useState } from "react";

const VISITS = [
  { visit: "V01", clinic: "C01", diagnosis: "Malaria" },
  { visit: "V02", clinic: "C02", diagnosis: "Pneumonia" },
  { visit: "V03", clinic: "C01", diagnosis: "Other" },
  { visit: "V04", clinic: "C99", diagnosis: "Malaria" },
];
const CLINICS = [
  { clinic: "C01", name: "Kondele Hospital", county: "Kisumu" },
  { clinic: "C02", name: "Ahero Health Centre", county: "Kisumu" },
  { clinic: "C03", name: "Lodwar Hospital", county: "Turkana" },
];

type How = "inner" | "left" | "right" | "outer";

function join(how: How) {
  const out: { visit?: string; clinic: string; diagnosis?: string; name?: string; county?: string }[] = [];
  const matched = new Set<string>();
  for (const v of VISITS) {
    const c = CLINICS.find((x) => x.clinic === v.clinic);
    if (c) { out.push({ ...v, name: c.name, county: c.county }); matched.add(c.clinic); }
    else if (how === "left" || how === "outer") out.push({ ...v });
  }
  if (how === "right" || how === "outer") {
    for (const c of CLINICS) if (!matched.has(c.clinic)) out.push({ clinic: c.clinic, name: c.name, county: c.county });
  }
  if (how === "right") return out.filter((r) => r.name);
  return out;
}

const COLS = ["visit", "clinic", "diagnosis", "name", "county"] as const;

/** Four ways to combine two tables — watch which rows survive and where the gaps appear. */
export default function JoinExplorer({ onInteract }: { onInteract: () => void }) {
  const [how, setHow] = useState<How>("inner");
  const rows = join(how);
  const cell = (v?: string) => (v === undefined ? <span className="rounded bg-danger-soft px-1.5 text-danger">NaN</span> : v);

  const small = (title: string, cols: string[], data: Record<string, string>[]) => (
    <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
      <p className="px-4 pt-3 text-xs font-semibold text-ink/50">{title}</p>
      <table className="w-full font-mono text-xs">
        <thead><tr>{cols.map((c) => <th key={c} className="px-4 py-2 text-left font-semibold text-ink/45">{c}</th>)}</tr></thead>
        <tbody>{data.map((r, i) => <tr key={i} className="border-t border-ink/5">{cols.map((c) => <td key={c} className={`px-4 py-1.5 ${c === "clinic" ? "font-semibold text-ink" : "text-ink/70"}`}>{r[c]}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {small("visits", ["visit", "clinic", "diagnosis"], VISITS)}
        {small("clinics", ["clinic", "name", "county"], CLINICS)}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <code className="font-mono text-sm text-ink/60">visits.merge(clinics, on=&quot;clinic&quot;, how=</code>
        <div className="inline-flex rounded-xl bg-ink/5 p-1">
          {(["inner", "left", "right", "outer"] as How[]).map((h) => (
            <button key={h} type="button" onClick={() => { setHow(h); onInteract(); }} className={`rounded-lg px-3 py-1.5 font-mono text-sm font-semibold ${how === h ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
              &quot;{h}&quot;
            </button>
          ))}
        </div>
        <code className="font-mono text-sm text-ink/60">)</code>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
        <p className="px-4 pt-3 text-xs font-semibold text-ink/50">result — {rows.length} rows</p>
        <table className="w-full font-mono text-xs">
          <thead><tr>{COLS.map((c) => <th key={c} className="px-4 py-2 text-left font-semibold text-ink/45">{c}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={i} className="border-t border-ink/5">{COLS.map((c) => <td key={c} className="px-4 py-1.5 text-ink/75">{cell(r[c])}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-ink/55">
        Visit V04 points to clinic C99, which doesn&apos;t exist; clinic C03 had no visits. An inner join silently drops both. A left join keeps every visit and shows the gap as NaN — which is how you find broken keys.
      </p>
    </div>
  );
}
