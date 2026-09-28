"use client";

import { useState } from "react";

type Row = { market: string; crop: string; date: string; price: number; updated: string };
type Mode = "append" | "replace" | "upsert";

// What the API publishes each night. Night 2 includes a correction to night 1.
const NIGHTS: Row[][] = [
  [
    { market: "Kitale", crop: "maize", date: "07-01", price: 3250, updated: "07-01 17:05" },
    { market: "Kisumu", crop: "maize", date: "07-01", price: 38500, updated: "07-01 17:12" },
    { market: "Kitale", crop: "beans", date: "07-01", price: 9100, updated: "07-01 17:05" },
  ],
  [
    { market: "Kisumu", crop: "maize", date: "07-01", price: 3850, updated: "07-02 08:10" },
    { market: "Kitale", crop: "maize", date: "07-02", price: 3300, updated: "07-02 17:03" },
    { market: "Kisumu", crop: "maize", date: "07-02", price: 3900, updated: "07-02 17:20" },
    { market: "Kitale", crop: "beans", date: "07-02", price: 9050, updated: "07-02 17:03" },
  ],
];

const MODES: Record<Mode, { label: string; sql: string }> = {
  append: { label: "append", sql: "INSERT INTO prices VALUES (...)" },
  replace: { label: "replace (full reload)", sql: "DELETE FROM prices; INSERT everything published so far" },
  upsert: { label: "upsert", sql: "INSERT ... ON CONFLICT (market, crop, date) DO UPDATE ... WHERE newer" },
};

const key = (r: Row) => `${r.market}|${r.crop}|${r.date}`;

/** Latest version of each key: what the table should hold. */
function truth(rows: Row[]) {
  const m = new Map<string, Row>();
  for (const r of rows) if (!m.has(key(r)) || m.get(key(r))!.updated < r.updated) m.set(key(r), r);
  return [...m.values()];
}

/** Run the nightly load with each strategy; watch counts and totals. */
export default function LoadModes({ onInteract }: { onInteract: () => void }) {
  const [mode, setMode] = useState<Mode>("append");
  const [night, setNight] = useState(0);
  const [table, setTable] = useState<Row[]>([]);
  const [loaded, setLoaded] = useState<Row[]>([]); // every batch ever loaded
  const [written, setWritten] = useState<number | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  function load(label: string) {
    const batch = NIGHTS[night];
    const seen = [...loaded, ...batch];
    let next: Row[];
    if (mode === "append") next = [...table, ...batch];
    else if (mode === "replace") next = truth(NIGHTS.slice(0, night + 1).flat());
    else {
      const m = new Map(table.map((r) => [key(r), r]));
      for (const r of batch) if (!m.has(key(r)) || m.get(key(r))!.updated < r.updated) m.set(key(r), r);
      next = [...m.values()];
    }
    setWritten(mode === "replace" ? next.length : batch.length);
    setTable(next);
    setLoaded(seen);
    setEvents((e) => [...e, label]);
    onInteract();
  }

  function reset(m: Mode = mode) {
    setMode(m);
    setNight(0);
    setTable([]);
    setLoaded([]);
    setWritten(null);
    setEvents([]);
    onInteract();
  }

  const want = truth(loaded);
  const total = table.reduce((s, r) => s + r.price, 0);
  const wantTotal = want.reduce((s, r) => s + r.price, 0);
  const counts = new Map<string, number>();
  table.forEach((r) => counts.set(key(r), (counts.get(key(r)) ?? 0) + 1));
  const ok = table.length === want.length && total === wantTotal;
  const button = "rounded-xl px-4 py-2 text-sm font-semibold ring-1 disabled:opacity-40";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(MODES) as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => reset(m)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${mode === m ? "bg-ink text-paper ring-ink" : "text-ink/60 ring-ink/15"}`}>
              {MODES[m].label}
            </button>
          ))}
        </div>
        <code className="block rounded-xl bg-code px-4 py-3 font-mono text-xs text-white/85">{MODES[mode].sql}</code>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-ink">Night {night + 1}{night === 1 ? ": includes a correction to Kisumu's 1 July maize price" : ""}</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => load(`night ${night + 1}: load`)} className={`${button} bg-ink text-paper ring-ink`}>Run tonight&apos;s load</button>
            <button type="button" disabled={!events.some((e) => e.startsWith(`night ${night + 1}`))} onClick={() => load(`night ${night + 1}: re-run after a crash`)} className={`${button} bg-paper text-ink ring-ink/15`}>Re-run it</button>
            <button type="button" disabled={night === NIGHTS.length - 1 || !events.some((e) => e.startsWith(`night ${night + 1}`))} onClick={() => { setNight(night + 1); onInteract(); }} className={`${button} bg-paper text-ink ring-ink/15`}>Next night →</button>
            <button type="button" onClick={() => reset()} className={`${button} text-ink/60 ring-ink/10`}>Reset</button>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-paper p-3 ring-1 ring-ink/10">
            <dt className="text-xs text-ink/50">rows</dt>
            <dd className="font-display text-xl font-semibold text-ink">{table.length}<span className="text-sm font-normal text-ink/45"> / {want.length}</span></dd>
          </div>
          <div className="rounded-2xl bg-paper p-3 ring-1 ring-ink/10">
            <dt className="text-xs text-ink/50">sum of prices</dt>
            <dd className="font-display text-xl font-semibold text-ink">{total.toLocaleString()}</dd>
          </div>
          <div className="rounded-2xl bg-paper p-3 ring-1 ring-ink/10">
            <dt className="text-xs text-ink/50">rows written</dt>
            <dd className="font-display text-xl font-semibold text-ink">{written ?? "–"}</dd>
          </div>
        </dl>
        {events.length > 0 && (
          <p className={`rounded-2xl p-4 text-sm ${ok ? "bg-lime-soft text-ink ring-1 ring-lime-deep/20" : "bg-danger-soft text-danger"}`}>
            {ok ? "✓ The table matches the source: one row per key, latest version." : `✗ The table disagrees with the source: it should hold ${want.length} rows summing to ${wantTotal.toLocaleString()}.`}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="text-left text-ink/45">
                {["market", "crop", "date", "price", "updated"].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {table.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-ink/40">empty table</td></tr>}
              {table.map((r, i) => {
                const dup = (counts.get(key(r)) ?? 0) > 1;
                return (
                  <tr key={i} className={`border-t border-ink/5 ${dup ? "bg-danger-soft text-danger" : ""}`}>
                    <td className="px-3 py-1.5">{r.market}</td>
                    <td className="px-3 py-1.5">{r.crop}</td>
                    <td className="px-3 py-1.5">{r.date}</td>
                    <td className={`px-3 py-1.5 ${r.price > 20000 ? "font-semibold text-danger" : ""}`}>{r.price.toLocaleString()}</td>
                    <td className="px-3 py-1.5 text-ink/50">{r.updated}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">Red rows share a key with another row. On night 1 Kisumu&apos;s maize price was typed with an extra zero, and the corrected version arrives on night 2.</p>
      </div>
    </div>
  );
}
