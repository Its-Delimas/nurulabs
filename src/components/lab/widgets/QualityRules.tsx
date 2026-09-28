"use client";

import { useState } from "react";

type Rec = { id: string; market: string; crop: string; unit: "90kg bag" | "kg"; price: string | null; date: string };

const TODAY = "2024-07-01";
const MARKETS = ["Kisumu", "Nairobi", "Eldoret", "Nakuru", "Mombasa", "Kitale", "Garissa", "Karatina"];

const RECORDS: Rec[] = [
  { id: "P1", market: "Kisumu", crop: "maize", unit: "90kg bag", price: "KSh 3,850", date: "2024-07-01" },
  { id: "P2", market: "KISUMU ", crop: "beans", unit: "90kg bag", price: "KSh 10,300", date: "2024-07-01" },
  { id: "P3", market: "Eldoret", crop: "maize", unit: "90kg bag", price: "KSh 35,100", date: "2024-07-01" },
  { id: "P4", market: "Garissa", crop: "beans", unit: "kg", price: "KSh 131.2", date: "2024-07-01" },
  { id: "P5", market: "Nakuru", crop: "sorghum", unit: "90kg bag", price: null, date: "2024-07-01" },
  { id: "P6", market: "Kampala", crop: "maize", unit: "90kg bag", price: "KSh 3,900", date: "2024-07-01" },
  { id: "P7", market: "Kitale", crop: "rice", unit: "90kg bag", price: "KSh 6,000", date: "2024-07-01" },
  { id: "P8", market: "Mombasa", crop: "maize", unit: "kg", price: "KSh 50.1", date: "2024-07-01" },
  { id: "P9", market: "Nairobi", crop: "maize", unit: "90kg bag", price: "KSh 4,100", date: "2024-07-11" },
  { id: "P1", market: "Kisumu", crop: "maize", unit: "90kg bag", price: "KSh 3,850", date: "2024-07-01" },
  { id: "P10", market: "Karatina", crop: "beans", unit: "90kg bag", price: "KSh 10,050", date: "2024-07-01" },
  { id: "P11", market: "Garissa", crop: "maize", unit: "kg", price: "KSh 5,190", date: "2024-07-01" },
];

const perBag = (r: Rec) => {
  if (r.price === null) return null;
  const v = Number(r.price.replace("KSh", "").replaceAll(",", "").trim());
  return r.unit === "kg" ? Math.round(v * 90) : v;
};
const tidy = (m: string) => m.trim().charAt(0).toUpperCase() + m.trim().slice(1).toLowerCase();

const RULES: { id: string; label: string; fails: (r: Rec, i: number) => string | null }[] = [
  { id: "present", label: "price is present", fails: (r) => (r.price === null ? "price is missing" : null) },
  { id: "range", label: "price per bag 1,000–20,000", fails: (r) => { const p = perBag(r); return p !== null && (p < 1000 || p > 20000) ? `KSh ${p.toLocaleString()} a bag is implausible` : null; } },
  { id: "market", label: "market is one we know (after tidying)", fails: (r) => (MARKETS.includes(tidy(r.market)) ? null : `unknown market "${r.market.trim()}"`) },
  { id: "crop", label: "crop is maize, beans or sorghum", fails: (r) => (["maize", "beans", "sorghum"].includes(r.crop) ? null : `unexpected crop "${r.crop}"`) },
  { id: "future", label: "date isn't in the future", fails: (r) => (r.date > TODAY ? `dated ${r.date}, after today` : null) },
  { id: "dupe", label: "id not seen already", fails: (r, i) => (RECORDS.findIndex((x) => x.id === r.id) < i ? `repeat of ${r.id}` : null) },
];

/** Switch validation rules on and see which records a contract quarantines. */
export default function QualityRules({ onInteract }: { onInteract: () => void }) {
  const [on, setOn] = useState<Record<string, boolean>>({});
  const results = RECORDS.map((r, i) => {
    for (const rule of RULES) if (on[rule.id]) { const why = rule.fails(r, i); if (why) return why; }
    return null;
  });
  const held = results.filter(Boolean).length;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <div className="space-y-4">
        <p className="text-sm font-semibold text-ink">Contract rules</p>
        {RULES.map((rule) => (
          <label key={rule.id} className="flex items-center gap-3 text-sm text-ink/80">
            <input type="checkbox" checked={!!on[rule.id]} onChange={(e) => { setOn({ ...on, [rule.id]: e.target.checked }); onInteract(); }} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
            {rule.label}
          </label>
        ))}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="rounded-2xl bg-lime-soft p-3 ring-1 ring-lime-deep/20">
            <p className="text-xs text-ink/55">loaded</p>
            <p className="font-display text-2xl font-semibold text-ink">{RECORDS.length - held}</p>
          </div>
          <div className="rounded-2xl bg-danger-soft p-3">
            <p className="text-xs text-ink/55">quarantined</p>
            <p className="font-display text-2xl font-semibold text-danger">{held}</p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
        <table className="w-full font-mono text-xs">
          <thead>
            <tr className="text-left text-ink/45">
              {["id", "market", "crop", "unit", "price", "date", "result"].map((h) => <th key={h} className="px-3 py-2 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {RECORDS.map((r, i) => (
              <tr key={i} className={`border-t border-ink/5 ${results[i] ? "bg-danger-soft" : ""}`}>
                <td className="px-3 py-1.5">{r.id}</td>
                <td className="whitespace-pre px-3 py-1.5">&quot;{r.market}&quot;</td>
                <td className="px-3 py-1.5">{r.crop}</td>
                <td className="px-3 py-1.5">{r.unit}</td>
                <td className="px-3 py-1.5">{r.price ?? "null"}</td>
                <td className="px-3 py-1.5">{r.date}</td>
                <td className={`px-3 py-1.5 font-sans ${results[i] ? "font-semibold text-danger" : "text-lime-deep"}`}>{results[i] ?? "✓ load"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
