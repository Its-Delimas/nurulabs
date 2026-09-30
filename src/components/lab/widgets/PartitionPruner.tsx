"use client";

import { useState } from "react";

// An illustrative national table: 3 years, 8 regions, about 1 TB of Parquet.
const TOTAL_GB = 1000;
const TIME = { none: 0, month: 1, day: 2, hour: 3 } as const;
const COUNT = { month: 36, day: 1096, hour: 26304 };
type Time = keyof typeof TIME;

const SCHEMES: { id: string; label: string; time: Time; region: boolean }[] = [
  { id: "none", label: "not partitioned", time: "none", region: false },
  { id: "month", label: "month", time: "month", region: false },
  { id: "day", label: "day", time: "day", region: false },
  { id: "region", label: "region", time: "none", region: true },
  { id: "month-region", label: "month + region", time: "month", region: true },
  { id: "hour-region", label: "hour + region", time: "hour", region: true },
];

const QUERIES: { id: string; label: string; sql: string; time: Time; region: boolean }[] = [
  { id: "month", label: "one month", sql: "WHERE month = '2024-03'", time: "month", region: false },
  { id: "day", label: "one day", sql: "WHERE day = '2024-03-15'", time: "day", region: false },
  { id: "region", label: "one region", sql: "WHERE region = 'Coast'", time: "none", region: true },
  { id: "both", label: "one region, one month", sql: "WHERE region = 'Coast' AND month = '2024-03'", time: "month", region: true },
  { id: "all", label: "everything", sql: "(no filter)", time: "none", region: false },
];

function size(gb: number) {
  if (gb >= 1) return `${gb >= 100 ? Math.round(gb).toLocaleString() : gb.toFixed(1)} GB`;
  return `${Math.max(1, Math.round(gb * 1000))} MB`;
}

/** How partitioning decides how much data a query reads. */
export default function PartitionPruner({ onInteract }: { onInteract: () => void }) {
  const [scheme, setScheme] = useState(SCHEMES[0]);
  const [query, setQuery] = useState(QUERIES[0]);

  // Time: a partition at least as fine as the filter prunes to the filter's share;
  // a coarser one prunes to the partition that contains it.
  let timeShare = 1;
  if (query.time !== "none" && scheme.time !== "none") {
    const level = TIME[scheme.time] >= TIME[query.time] ? query.time : scheme.time;
    timeShare = 1 / COUNT[level as "month" | "day"];
  }
  const regionShare = query.region && scheme.region ? 1 / 8 : 1;
  const scanned = TOTAL_GB * timeShare * regionShare;
  const files = scheme.time === "none" && !scheme.region ? 1000 : (scheme.time === "none" ? 1 : COUNT[scheme.time]) * (scheme.region ? 8 : 1);
  const fileGb = TOTAL_GB / files;
  const tiny = fileGb < 0.128;

  const chip = (active: boolean) => `rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${active ? "bg-ink text-paper ring-ink" : "text-ink/60 ring-ink/15"}`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-semibold text-ink/50">partition the table by</p>
          <div className="flex flex-wrap gap-2">
            {SCHEMES.map((s) => <button key={s.id} type="button" onClick={() => { setScheme(s); onInteract(); }} className={chip(scheme.id === s.id)}>{s.label}</button>)}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-ink/50">the query asks for</p>
          <div className="flex flex-wrap gap-2">
            {QUERIES.map((q) => <button key={q.id} type="button" onClick={() => { setQuery(q); onInteract(); }} className={chip(query.id === q.id)}>{q.label}</button>)}
          </div>
        </div>
        <code className="block rounded-xl bg-code px-4 py-3 font-mono text-xs text-white/85">SELECT SUM(amount) FROM transactions {query.sql}</code>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
          <p className="text-xs text-ink/55">data scanned</p>
          <p className="font-display text-3xl font-semibold text-ink">{size(scanned)}</p>
          <div className="mt-3 h-3 rounded-full bg-ink/5">
            <div className="h-3 rounded-full bg-lime-deep" style={{ width: `${Math.max(0.6, (scanned / TOTAL_GB) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs text-ink/50">of {TOTAL_GB.toLocaleString()} GB in the table</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-paper p-3 ring-1 ring-ink/10">
            <p className="text-xs text-ink/55">files in the table</p>
            <p className="font-display text-xl font-semibold text-ink">{files.toLocaleString()}</p>
          </div>
          <div className={`rounded-2xl p-3 ring-1 ${tiny ? "bg-danger-soft ring-danger/20" : "bg-paper ring-ink/10"}`}>
            <p className="text-xs text-ink/55">typical file</p>
            <p className={`font-display text-xl font-semibold ${tiny ? "text-danger" : "text-ink"}`}>{size(fileGb)}</p>
          </div>
        </div>
        {tiny && <p className="text-xs leading-relaxed text-danger">Too many small files: listing and opening hundreds of thousands of files costs more than the data they hold.</p>}
        <p className="text-xs leading-relaxed text-ink/50">An illustrative table: three years of national transactions across 8 regions, about 1 TB of Parquet. Engines can skip more inside each file using its statistics; this shows partition pruning alone.</p>
      </div>
    </div>
  );
}
