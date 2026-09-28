"use client";

import { useState } from "react";

// Cleaned visits per county (from the lab's clinic data).
const TABLE = [
  { county: "Kakamega", visits: 212, malaria: 78 },
  { county: "Kisumu", visits: 125, malaria: 51 },
  { county: "Mombasa", visits: 137, malaria: 20 },
  { county: "Nairobi", visits: 587, malaria: 23 },
  { county: "Nakuru", visits: 242, malaria: 17 },
  { county: "Turkana", visits: 88, malaria: 34 },
];

/** Build a query clause by clause, in SQL and pandas at once. */
export default function SqlPandas({ onInteract }: { onInteract: () => void }) {
  const [where, setWhere] = useState(false);
  const [share, setShare] = useState(false);
  const [order, setOrder] = useState(false);
  const [limit, setLimit] = useState(false);
  const toggle = (set: (v: boolean) => void, v: boolean) => () => { set(!v); onInteract(); };

  let rows = TABLE.map((r) => ({ ...r, share: r.malaria / r.visits }));
  if (where) rows = rows.filter((r) => r.visits >= 100);
  if (order) rows = [...rows].sort((a, b) => (share ? b.share - a.share : b.malaria - a.malaria));
  if (limit) rows = rows.slice(0, 3);
  const sortCol = share ? "share" : "malaria";

  const sql = [
    `SELECT county, visits, malaria${share ? ",\n       1.0 * malaria / visits AS share" : ""}`,
    "FROM county_summary",
    where && "WHERE visits >= 100",
    order && `ORDER BY ${sortCol} DESC`,
    limit && "LIMIT 3",
  ].filter(Boolean).join("\n");
  const pandas = [
    "(county_summary",
    share && '   .assign(share=lambda d: d["malaria"] / d["visits"])',
    where && '   .query("visits >= 100")',
    order && `   .sort_values("${sortCol}", ascending=False)`,
    limit && "   .head(3)",
    ")",
  ].filter(Boolean).join("\n");

  const box = (label: string, on: boolean, fn: () => void) => (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-paper px-4 py-2.5 text-sm text-ink ring-1 ring-ink/10">
      <input type="checkbox" checked={on} onChange={fn} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
      {label}
    </label>
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {box("compute malaria share", share, toggle(setShare, share))}
        {box("WHERE visits ≥ 100", where, toggle(setWhere, where))}
        {box("ORDER BY, largest first", order, toggle(setOrder, order))}
        {box("LIMIT 3", limit, toggle(setLimit, limit))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <pre className="overflow-x-auto rounded-2xl bg-code p-4 font-mono text-xs leading-6 text-white/90"><span className="text-white/45">-- SQL{"\n"}</span>{sql}</pre>
        <pre className="overflow-x-auto rounded-2xl bg-code p-4 font-mono text-xs leading-6 text-white/90"><span className="text-white/45"># pandas{"\n"}</span>{pandas}</pre>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
        <table className="w-full font-mono text-xs">
          <thead><tr>{["county", "visits", "malaria", ...(share ? ["share"] : [])].map((h) => <th key={h} className="px-4 py-2 text-left font-semibold text-ink/45">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.county} className="border-t border-ink/5">
              <td className="px-4 py-1.5 text-ink">{r.county}</td><td className="px-4 py-1.5 text-ink/70">{r.visits}</td><td className="px-4 py-1.5 text-ink/70">{r.malaria}</td>
              {share && <td className="px-4 py-1.5 text-ink/70">{r.share.toFixed(3)}</td>}
            </tr>
          ))}</tbody>
        </table>
      </div>
      <p className="text-xs leading-relaxed text-ink/55">SQL runs inside the database, so only the answer travels to you — essential when the table has millions of rows. pandas works on data already in memory. Analysts use SQL to pull and shape data, then pandas to analyse it.</p>
    </div>
  );
}
