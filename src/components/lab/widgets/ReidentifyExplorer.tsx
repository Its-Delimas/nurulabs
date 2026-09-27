"use client";

import { useMemo, useState } from "react";
import { APPLICANTS, type Applicant } from "@/lib/curriculum/data/loan-model";

const FIELDS: { key: keyof Applicant; label: string; band: (a: Applicant) => string | number }[] = [
  { key: "age", label: "age", band: (a) => `${Math.floor(a.age / 10) * 10}s` },
  { key: "gender", label: "gender", band: (a) => a.gender },
  { key: "region", label: "urban / rural", band: (a) => a.region },
  { key: "months_as_customer", label: "months as customer", band: (a) => `${Math.floor((a.months_as_customer - 1) / 12) + 1} yr` },
  { key: "existing_loans", label: "number of loans", band: (a) => (a.existing_loans > 0 ? "some" : "none") },
];

/** Names removed — but how many people can still be singled out? */
export default function ReidentifyExplorer({ onInteract }: { onInteract: () => void }) {
  const [known, setKnown] = useState<Set<string>>(new Set(["age", "gender", "region"]));
  const [generalise, setGeneralise] = useState(false);

  const { unique, k, groups } = useMemo(() => {
    const fs = FIELDS.filter((f) => known.has(f.key));
    const key = (a: Applicant) => fs.map((f) => (generalise ? f.band(a) : a[f.key])).join("|");
    const sizes = new Map<string, number>();
    APPLICANTS.forEach((a) => sizes.set(key(a), (sizes.get(key(a)) ?? 0) + 1));
    const counts = APPLICANTS.map((a) => sizes.get(key(a))!);
    return { unique: counts.filter((c) => c === 1).length, k: Math.min(...counts), groups: sizes.size };
  }, [known, generalise]);

  const toggle = (f: string) => {
    const next = new Set(known);
    if (next.has(f)) next.delete(f); else next.add(f);
    setKnown(next);
    onInteract();
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <p className="text-sm text-ink/60">The lender shares its loan data with names and IDs removed. An attacker knows these facts about their neighbour:</p>
        <div className="flex flex-wrap gap-2">
          {FIELDS.map((f) => (
            <button key={f.key} type="button" onClick={() => toggle(f.key)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${known.has(f.key) ? "bg-ink text-paper ring-ink" : "text-ink/60 ring-ink/15"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm text-ink/70">
          <input type="checkbox" checked={generalise} onChange={(e) => { setGeneralise(e.target.checked); onInteract(); }} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
          Generalise before sharing (age in decades, tenure in years, loans as none/some)
        </label>
      </div>
      <div className="space-y-3">
        <div className={`rounded-2xl p-5 ${unique / APPLICANTS.length > 0.1 ? "bg-danger-soft" : "bg-lime-soft ring-1 ring-lime-deep/20"}`}>
          <p className="text-xs text-ink/55">people who are the only match — re-identified</p>
          <p className="font-display text-3xl font-semibold text-ink">{unique} of {APPLICANTS.length} ({Math.round((unique / APPLICANTS.length) * 100)}%)</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
            <p className="text-xs text-ink/50">smallest group (k)</p>
            <p className="font-mono text-xl text-ink">{k}</p>
          </div>
          <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
            <p className="text-xs text-ink/50">distinct combinations</p>
            <p className="font-mono text-xl text-ink">{groups}</p>
          </div>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">
          A dataset is <strong>k-anonymous</strong> when every combination of these &ldquo;quasi-identifiers&rdquo; is shared by at least k people. Removing names isn&apos;t anonymisation: a few ordinary facts together can point to exactly one person.
        </p>
      </div>
    </div>
  );
}
