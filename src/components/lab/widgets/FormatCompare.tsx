"use client";

import { useState } from "react";

// Measured in Pyodide: 200,000 transactions (5 columns) written by pandas.
const FORMATS = [
  { name: "CSV", size: 6.5, write: 1.39, read: 0.38, types: false, columnar: false, note: "Text anyone can open — but every value is a string again when you read it back." },
  { name: "JSON", size: 15.7, write: 0.65, read: null, types: false, columnar: false, note: "Great for nested API data; bulky for tables because every row repeats every column name." },
  { name: "Parquet", size: 2.5, write: 0.19, read: 0.2, types: true, columnar: true, note: "Columnar, compressed and typed. The standard format of data lakes and warehouses." },
] as const;

/** One table, three file formats: size, speed and what survives the round trip. */
export default function FormatCompare({ onInteract }: { onInteract: () => void }) {
  const [sel, setSel] = useState(2);
  const [oneColumn, setOneColumn] = useState(false);
  const max = 15.7;
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        {FORMATS.map((f, i) => {
          const read = f.columnar && oneColumn ? f.size / 5 : f.size;
          return (
            <button key={f.name} type="button" onClick={() => { setSel(i); onInteract(); }} className={`block w-full rounded-2xl p-4 text-left ring-1 transition-colors ${sel === i ? "bg-paper ring-ink/30" : "bg-paper/60 ring-ink/10"}`}>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-lg font-semibold text-ink">{f.name}</span>
                <span className="font-mono text-sm text-ink/70">{f.size} MB on disk</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-ink/5"><div className="h-3 rounded-full bg-lime-deep" style={{ width: `${(f.size / max) * 100}%` }} /></div>
              {oneColumn && <p className="mt-2 font-mono text-xs text-ink/55">data read for one column: ≈{read.toFixed(1)} MB{f.columnar ? " (only that column)" : " (the whole file)"}</p>}
            </button>
          );
        })}
        <label className="flex items-center gap-3 text-sm text-ink/70">
          <input type="checkbox" checked={oneColumn} onChange={(e) => { setOneColumn(e.target.checked); onInteract(); }} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
          I only need the <code>amount</code> column
        </label>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
          <p className="font-display text-xl font-semibold text-ink">{FORMATS[sel].name}</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <dt className="text-ink/50">write</dt><dd className="font-mono text-ink">{FORMATS[sel].write} s</dd>
            <dt className="text-ink/50">read back</dt><dd className="font-mono text-ink">{FORMATS[sel].read ?? "—"}{FORMATS[sel].read ? " s" : ""}</dd>
            <dt className="text-ink/50">keeps types</dt><dd className={FORMATS[sel].types ? "text-lime-deep" : "text-danger"}>{FORMATS[sel].types ? "yes — dates stay dates" : "no — dates, IDs become text or numbers"}</dd>
            <dt className="text-ink/50">columnar</dt><dd className="text-ink">{FORMATS[sel].columnar ? "yes" : "no — row by row"}</dd>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-ink/60">{FORMATS[sel].note}</p>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">Sizes and times measured in this browser&apos;s Python on 200,000 illustrative transactions. Exact numbers vary by data; the pattern doesn&apos;t.</p>
      </div>
    </div>
  );
}
