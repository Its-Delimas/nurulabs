"use client";

import { useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// What a clinic clerk meant, and how it was typed.
const SAMPLES: { typed: string; meant: [number, number, number] }[] = [
  { typed: "2024-03-05", meant: [2024, 3, 5] },
  { typed: "05/03/2024", meant: [2024, 3, 5] },
  { typed: "5 Mar 2024", meant: [2024, 3, 5] },
  { typed: "2024-11-02", meant: [2024, 11, 2] },
  { typed: "02/11/2024", meant: [2024, 11, 2] },
  { typed: "25/12/2024", meant: [2024, 12, 25] },
  { typed: "2024-01-09", meant: [2024, 1, 9] },
];

type Strategy = "default" | "dayfirst" | "rules";

const STRATEGIES: Record<Strategy, { label: string; code: string }> = {
  default: { label: "pandas default", code: 'pd.to_datetime(s, format="mixed")' },
  dayfirst: { label: "day first, everywhere", code: 'pd.to_datetime(s, format="mixed", dayfirst=True)' },
  rules: { label: "one rule per format", code: 'iso.fillna(dmy).fillna(text)   # three explicit formats' },
};

function parse(typed: string, s: Strategy): [number, number, number] | null {
  let m = typed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [y, a, b] = [+m[1], +m[2], +m[3]];
    // With dayfirst, pandas' mixed parser swaps day and month even in ISO dates when it can.
    if (s === "dayfirst" && b <= 12) return [y, b, a];
    return [y, a, b];
  }
  m = typed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [a, b, y] = [+m[1], +m[2], +m[3]];
    if (s === "default") return b > 12 ? [y, b, a] : a > 12 ? [y, b, a] : [y, a, b];
    return [y, b, a];
  }
  m = typed.match(/^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/);
  if (m) return [+m[3], MONTHS.indexOf(m[2]) + 1, +m[1]];
  return null;
}

const show = (d: [number, number, number] | null) => (d ? `${d[2]} ${MONTHS[d[1] - 1]} ${d[0]}` : "NaT");

/** The same clerk, three date formats — and three ways to read them. */
export default function DateFormats({ onInteract }: { onInteract: () => void }) {
  const [s, setS] = useState<Strategy>("default");
  const results = SAMPLES.map((x) => ({ ...x, got: parse(x.typed, s) }));
  const wrong = results.filter((r) => !r.got || r.got.join() !== r.meant.join()).length;

  return (
    <div className="space-y-5">
      <div className="inline-flex flex-wrap rounded-xl bg-ink/5 p-1">
        {(Object.keys(STRATEGIES) as Strategy[]).map((k) => (
          <button key={k} type="button" onClick={() => { setS(k); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${s === k ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
            {STRATEGIES[k].label}
          </button>
        ))}
      </div>
      <code className="block rounded-xl bg-code px-4 py-3 font-mono text-xs text-white/85">{STRATEGIES[s].code}</code>
      <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-ink/45"><th className="px-4 py-2">typed</th><th className="px-4 py-2">clerk meant</th><th className="px-4 py-2">parsed as</th><th /></tr></thead>
          <tbody>
            {results.map((r) => {
              const ok = r.got && r.got.join() === r.meant.join();
              return (
                <tr key={r.typed} className="border-t border-ink/5">
                  <td className="px-4 py-2 font-mono text-ink">{r.typed}</td>
                  <td className="px-4 py-2 text-ink/60">{show(r.meant)}</td>
                  <td className={`px-4 py-2 font-mono ${ok ? "text-ink" : "font-semibold text-danger"}`}>{show(r.got)}</td>
                  <td className="px-4 py-2 text-right">{ok ? "✓" : "✗"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className={`text-sm font-semibold ${wrong ? "text-danger" : "text-lime-deep"}`}>{wrong ? `${wrong} of ${SAMPLES.length} dates silently wrong — no error, no warning.` : "All dates correct."}</p>
      <p className="text-xs leading-relaxed text-ink/55">
        Kenya writes day/month/year; the pandas default assumes month first. Telling pandas &ldquo;day first&rdquo; for everything fixes one problem and quietly creates another. The safe approach: one explicit rule per format, then check nothing is left unparsed.
      </p>
    </div>
  );
}
