"use client";

import { useState } from "react";

const DATA = [
  { county: "Nairobi", share: 3.9 },
  { county: "Kisumu", share: 40.8 },
  { county: "Mombasa", share: 14.6 },
  { county: "Turkana", share: 38.6 },
  { county: "Nakuru", share: 7.0 },
  { county: "Kakamega", share: 36.8 },
];

const FIXES = [
  { id: "sort", label: "Sort the bars" },
  { id: "horizontal", label: "Go horizontal so labels read easily" },
  { id: "highlight", label: "Highlight the point you're making" },
  { id: "labels", label: "Label values directly, drop the gridlines" },
  { id: "title", label: "Write a title that states the finding" },
] as const;

type Fix = (typeof FIXES)[number]["id"];

/** Start from a default chart and apply design fixes one at a time. */
export default function ChartMakeover({ onInteract }: { onInteract: () => void }) {
  const [on, setOn] = useState<Set<Fix>>(new Set());
  const has = (f: Fix) => on.has(f);
  const data = has("sort") ? [...DATA].sort((a, b) => (has("horizontal") ? b.share - a.share : a.share - b.share)) : DATA;
  const max = 45;
  const lake = (c: string) => ["Kisumu", "Kakamega"].includes(c);
  const color = (c: string) => (has("highlight") ? (lake(c) ? "var(--color-lime-deep)" : "color-mix(in srgb, var(--color-ink) 22%, transparent)") : ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc948"][DATA.findIndex((d) => d.county === c)]);
  const toggle = (f: Fix) => { const n = new Set(on); if (n.has(f)) n.delete(f); else n.add(f); setOn(n); onInteract(); };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
      <div className="space-y-2">
        {FIXES.map((f) => (
          <label key={f.id} className="flex cursor-pointer items-center gap-3 rounded-xl bg-paper px-4 py-3 text-sm text-ink ring-1 ring-ink/10">
            <input type="checkbox" checked={has(f.id)} onChange={() => toggle(f.id)} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
            {f.label}
          </label>
        ))}
      </div>
      <figure className="rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
        <figcaption className={`mb-4 ${has("title") ? "font-display text-lg font-semibold text-ink" : "text-sm text-ink/60"}`}>
          {has("title") ? "Malaria is over a third of clinic visits around Lake Victoria and in Turkana — under 10% in Nairobi and Nakuru" : "share by county"}
        </figcaption>
        {has("horizontal") ? (
          <div className="space-y-2">
            {data.map((d) => (
              <div key={d.county} className="grid grid-cols-[5.5rem_1fr] items-center gap-3 text-sm">
                <span className="text-right text-ink/70">{d.county}</span>
                <div className="flex items-center gap-2">
                  <span className="h-6 rounded-sm" style={{ width: `${(d.share / max) * 100}%`, background: color(d.county) }} />
                  {has("labels") && <span className="font-mono text-xs text-ink/70">{d.share.toFixed(0)}%</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative flex h-56 items-end gap-3 border-b border-l border-ink/20 pl-2" style={has("labels") ? {} : { backgroundImage: "repeating-linear-gradient(to top, color-mix(in srgb, var(--color-ink) 12%, transparent) 0 1px, transparent 1px 44px)" }}>
            {data.map((d) => (
              <div key={d.county} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ height: "100%" }}>
                {has("labels") && <span className="font-mono text-[10px] text-ink/70">{d.share.toFixed(0)}%</span>}
                <span className="w-full rounded-t-sm" style={{ height: `${(d.share / max) * 100}%`, background: color(d.county) }} />
                <span className="absolute -bottom-10 origin-top-left rotate-45 text-[10px] text-ink/60" style={{ marginLeft: "-0.5rem" }}>{d.county}</span>
              </div>
            ))}
          </div>
        )}
        {!has("horizontal") && <div className="h-10" />}
        <p className="mt-3 text-xs text-ink/45">Malaria as a share of all clinic visits, 2023–2024 (illustrative records).</p>
      </figure>
    </div>
  );
}
