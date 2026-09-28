"use client";

import { useState } from "react";

// World Bank WDI (CC BY 4.0): access to electricity, % of population.
const CONTEXT = [
  { id: "trend", label: "Compared with the past", text: "up from 15% in 2000" },
  { id: "peers", label: "Compared with peers", text: "the biggest gain of 20 African countries in the data, and well ahead of Uganda (47%) and Tanzania (46%)" },
  { id: "gap", label: "Who's left behind", text: "though 32% of rural Kenyans still lack it, against 2% in towns" },
  { id: "meaning", label: "What it means", text: "— roughly 13 million people still without power" },
] as const;

/** The same number, with and without the context that gives it meaning. */
export default function NumbersInContext({ onInteract }: { onInteract: () => void }) {
  const [on, setOn] = useState<Set<string>>(new Set());
  const toggle = (id: string) => { const n = new Set(on); if (n.has(id)) n.delete(id); else n.add(id); setOn(n); onInteract(); };
  const parts = CONTEXT.filter((c) => on.has(c.id)).map((c) => c.text);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      <div className="space-y-2">
        {CONTEXT.map((c) => (
          <label key={c.id} className="flex cursor-pointer items-center gap-3 rounded-xl bg-paper px-4 py-3 text-sm text-ink ring-1 ring-ink/10">
            <input type="checkbox" checked={on.has(c.id)} onChange={() => toggle(c.id)} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
            {c.label}
          </label>
        ))}
      </div>
      <div className="space-y-4">
        <p className="font-display text-2xl font-semibold leading-snug text-ink">
          76% of Kenyans had electricity in 2022{parts.length ? ", " : "."}
          {parts.map((p, i) => <span key={p} className="text-lime-deep">{p}{i < parts.length - 1 ? ", " : "."}</span>)}
        </p>
        <p className="text-xs leading-relaxed text-ink/55">
          Real World Bank figures (CC BY 4.0). &ldquo;76%&rdquo; alone doesn&apos;t say whether that&apos;s good. A number becomes information when it&apos;s compared: with the past, with peers, across groups — and translated into what it means for people. The rural figure (68% with access) and the population (54 million) are from the same source.
        </p>
      </div>
    </div>
  );
}
