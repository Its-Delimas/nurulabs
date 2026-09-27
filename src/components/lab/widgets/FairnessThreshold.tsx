"use client";

import { useMemo, useState } from "react";
import { APPLICANTS, scoreApplicant } from "@/lib/curriculum/data/loan-model";
import Slider from "./Slider";

const scored = APPLICANTS.map((a) => ({ region: a.region, repaid: a.repaid, p: scoreApplicant(a as never).p }));

function stats(region: string, t: number) {
  const g = scored.filter((s) => s.region === region);
  const approved = g.filter((s) => s.p >= t);
  const repayers = g.filter((s) => s.repaid === 1);
  return {
    approval: approved.length / g.length,
    tpr: repayers.filter((s) => s.p >= t).length / repayers.length,
    repayRate: repayers.length / g.length,
  };
}

/** One lending model, two groups: move the approval threshold(s) and watch who gets a loan. */
export default function FairnessThreshold({ onInteract }: { onInteract: () => void }) {
  const [split, setSplit] = useState(false);
  const [tUrban, setTUrban] = useState(0.5);
  const [tRural, setTRural] = useState(0.5);
  const tR = split ? tRural : tUrban;
  const u = useMemo(() => stats("urban", tUrban), [tUrban]);
  const r = useMemo(() => stats("rural", tR), [tR]);
  const correct = scored.filter((s) => (s.p >= (s.region === "urban" ? tUrban : tR)) === (s.repaid === 1)).length;

  const bar = (label: string, v: number) => (
    <div>
      <div className="flex justify-between text-xs text-ink/55"><span>{label}</span><span className="font-mono text-ink">{Math.round(v * 100)}%</span></div>
      <div className="mt-1 h-2.5 rounded-full bg-ink/10"><div className="h-2.5 rounded-full bg-lime-deep" style={{ width: `${v * 100}%` }} /></div>
    </div>
  );

  const card = (name: string, s: ReturnType<typeof stats>) => (
    <div className="space-y-3 rounded-2xl bg-paper p-5 ring-1 ring-ink/10">
      <p className="font-display text-lg font-semibold text-ink">{name}</p>
      {bar("actually repay", s.repayRate)}
      {bar("approved", s.approval)}
      {bar("repayers approved (true positive rate)", s.tpr)}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-xl bg-ink/5 p-1">
        {[false, true].map((v) => (
          <button key={String(v)} type="button" onClick={() => { setSplit(v); setTRural(tUrban); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${split === v ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
            {v ? "separate thresholds" : "one threshold for all"}
          </button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Slider label={split ? "urban: approve when P(repay) ≥" : "approve when P(repay) ≥"} value={tUrban} min={0.2} max={0.9} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => { setTUrban(v); onInteract(); }} />
        {split && <Slider label="rural: approve when P(repay) ≥" value={tRural} min={0.2} max={0.9} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => { setTRural(v); onInteract(); }} />}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {card("Urban applicants", u)}
        {card("Rural applicants", r)}
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-3 rounded-2xl bg-cream p-4">
        <p className="text-sm text-ink/65">Gap in repayers approved (urban − rural): <span className="font-mono font-semibold text-ink">{Math.round((u.tpr - r.tpr) * 100)} points</span></p>
        <p className="text-sm text-ink/65">Overall accuracy: <span className="font-mono font-semibold text-ink">{Math.round((correct / scored.length) * 100)}%</span></p>
      </div>
      <p className="text-xs leading-relaxed text-ink/55">
        The real model from this lab, scored on all 600 illustrative applicants. It never sees the region — yet rural applicants, who repay at least as often, are approved less, because their recorded income misses informal earnings.
      </p>
    </div>
  );
}
