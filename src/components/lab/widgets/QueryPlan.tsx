"use client";

import { useState } from "react";
import Slider from "./Slider";

/** Find one customer's rows: read every row, or jump there with an index. */
export default function QueryPlan({ onInteract }: { onInteract: () => void }) {
  const [rows, setRows] = useState(200_000);
  const [index, setIndex] = useState(false);
  const scanned = index ? Math.ceil(Math.log2(rows)) + 10 : rows;
  const cells = 400;
  const lit = index ? 6 : cells;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="grid grid-cols-[repeat(40,minmax(0,1fr))] gap-0.5 rounded-2xl bg-paper p-3 ring-1 ring-ink/10" aria-hidden="true">
          {Array.from({ length: cells }, (_, i) => (
            <span key={i} className={`aspect-square rounded-[2px] ${(index ? i >= 212 && i < 212 + lit : true) ? "bg-lime-deep" : "bg-ink/10"} ${i >= 212 && i < 218 ? "ring-1 ring-sun" : ""}`} />
          ))}
        </div>
        <code className="block whitespace-pre-wrap rounded-xl bg-code px-4 py-3 font-mono text-xs text-white/85">
          EXPLAIN QUERY PLAN SELECT … WHERE customer = 123;{"\n"}→ {index ? "SEARCH tx USING INDEX ix_customer (customer=?)" : "SCAN tx"}
        </code>
      </div>
      <div className="space-y-5">
        <Slider label="rows in the table" value={rows} min={10_000} max={10_000_000} step={10_000} format={(v) => v.toLocaleString()} onChange={(v) => { setRows(v); onInteract(); }} />
        <div className="inline-flex rounded-xl bg-ink/5 p-1">
          {[false, true].map((v) => (
            <button key={String(v)} type="button" onClick={() => { setIndex(v); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${index === v ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
              {v ? "with an index" : "no index"}
            </button>
          ))}
        </div>
        <div className={`rounded-2xl p-4 ${index ? "bg-lime-soft ring-1 ring-lime-deep/20" : "bg-danger-soft"}`}>
          <p className="text-xs text-ink/55">rows the database must look at (roughly)</p>
          <p className="font-display text-2xl font-semibold text-ink">{scanned.toLocaleString()}</p>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">Without an index the database reads every row. A B-tree index is like a sorted phone book: about log₂(n) steps to find the place, then only the matching rows. Ten million rows → about 24 steps. Indexes cost space and slow down writes, so add them for the columns you filter and join on.</p>
      </div>
    </div>
  );
}
