"use client";

import { useState } from "react";

const PARTS = [
  { id: "kpis", label: "3 headline KPI tiles", good: true },
  { id: "trend", label: "Monthly trend line with last year", good: true },
  { id: "ranking", label: "Sorted bar chart of counties", good: true },
  { id: "table", label: "Full table of 1,400 visits", good: false, warn: "Raw tables belong in a download link, not on the dashboard." },
  { id: "pie", label: "Pie chart of 5 diagnoses", good: false, warn: "Five similar slices are hard to compare — use a sorted bar." },
  { id: "gauges", label: "Six speedometer gauges", good: false, warn: "Gauges use lots of space to show one number each, with no comparison." },
  { id: "kpis12", label: "Twelve more KPI tiles", good: false, warn: "Fifteen numbers means nothing stands out. Pick the 3–5 that drive decisions." },
] as const;

type PartId = (typeof PARTS)[number]["id"];

/** Build a dashboard for a busy county health director — and see what helps and what clutters. */
export default function DashboardBuilder({ onInteract }: { onInteract: () => void }) {
  const [on, setOn] = useState<Set<PartId>>(new Set(["kpis"]));
  const toggle = (id: PartId) => { const n = new Set(on); if (n.has(id)) n.delete(id); else n.add(id); setOn(n); onInteract(); };
  const chosen = PARTS.filter((p) => on.has(p.id));
  const warnings = chosen.filter((p) => !p.good);
  const score = chosen.filter((p) => p.good).length - warnings.length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div className="space-y-2">
        <p className="text-sm text-ink/60">Audience: the county health director, who has two minutes before a meeting.</p>
        {PARTS.map((p) => (
          <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-xl bg-paper px-4 py-2.5 text-sm text-ink ring-1 ring-ink/10">
            <input type="checkbox" checked={on.has(p.id)} onChange={() => toggle(p.id)} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
            {p.label}
          </label>
        ))}
      </div>
      <div className="space-y-3">
        <div className="grid min-h-64 grid-cols-6 gap-2 rounded-2xl bg-paper p-3 ring-1 ring-ink/10">
          {on.has("kpis") && ["Visits", "Malaria share", "vs last year"].map((k) => <div key={k} className="col-span-2 rounded-lg bg-cream p-2 text-[10px] text-ink/60">{k}<p className="font-display text-lg font-semibold text-ink">■■</p></div>)}
          {on.has("kpis12") && Array.from({ length: 12 }, (_, i) => <div key={i} className="col-span-1 rounded bg-cream p-1 text-[8px] text-ink/40">KPI {i + 4}</div>)}
          {on.has("trend") && <div className="col-span-4 h-20 rounded-lg bg-lime-soft p-2 text-[10px] text-ink/60">trend ⟋⟍⟋</div>}
          {on.has("ranking") && <div className="col-span-2 h-20 rounded-lg bg-lime-soft p-2 text-[10px] text-ink/60">ranking ▬▬▬</div>}
          {on.has("pie") && <div className="col-span-2 h-20 rounded-lg bg-danger-soft p-2 text-[10px] text-ink/60">pie ◔</div>}
          {on.has("gauges") && Array.from({ length: 6 }, (_, i) => <div key={i} className="col-span-1 h-12 rounded-full bg-danger-soft" />)}
          {on.has("table") && <div className="col-span-6 h-16 rounded-lg bg-danger-soft p-2 text-[10px] text-ink/60">table ▤▤▤▤▤▤▤▤</div>}
        </div>
        <div className={`rounded-2xl p-4 text-sm ${warnings.length ? "bg-danger-soft" : score >= 3 ? "bg-lime-soft ring-1 ring-lime-deep/20" : "bg-cream"}`}>
          {warnings.length ? warnings.map((w) => <p key={w.id}>• {"warn" in w ? w.warn : ""}</p>) : score >= 3 ? <p>Focused: a few headline numbers, the trend and a comparison — readable in the two minutes the director has.</p> : <p>Add what the director needs: headline numbers, how things are changing, and how places compare.</p>}
        </div>
        <p className="text-xs leading-relaxed text-ink/55">Power BI, Tableau, Looker Studio and Excel all make it easy to add more. A good dashboard answers a few recurring questions for one audience at a glance.</p>
      </div>
    </div>
  );
}
