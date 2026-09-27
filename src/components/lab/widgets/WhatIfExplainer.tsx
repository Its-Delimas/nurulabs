"use client";

import { useState } from "react";
import { scoreApplicant } from "@/lib/curriculum/data/loan-model";
import Slider from "./Slider";

const LABELS: Record<string, string> = {
  monthly_income_ksh: "recorded income",
  mobile_money_txns: "mobile-money txns / month",
  months_as_customer: "months as customer",
  existing_loans: "existing loans",
  age: "age",
};

// Applicant A0241: rural, repaid her loan — but the model turned her down.
const START = { monthly_income_ksh: 11700, mobile_money_txns: 9, months_as_customer: 49, existing_loans: 0, age: 52 };

/** Change one applicant's details and see why the model's answer changes. */
export default function WhatIfExplainer({ onInteract }: { onInteract: () => void }) {
  const [a, setA] = useState(START);
  const { contributions, p } = scoreApplicant(a);
  const set = (k: keyof typeof START) => (v: number) => { setA({ ...a, [k]: v }); onInteract(); };
  const max = 2.5;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-4">
        <Slider label="recorded income (KSh / month)" value={a.monthly_income_ksh} min={5000} max={80000} step={500} format={(v) => v.toLocaleString()} onChange={set("monthly_income_ksh")} />
        <Slider label="mobile-money transactions / month" value={a.mobile_money_txns} min={0} max={50} onChange={set("mobile_money_txns")} />
        <Slider label="months as customer" value={a.months_as_customer} min={1} max={60} onChange={set("months_as_customer")} />
        <Slider label="existing loans" value={a.existing_loans} min={0} max={4} onChange={set("existing_loans")} />
        <Slider label="age" value={a.age} min={20} max={60} onChange={set("age")} />
        <button type="button" onClick={() => { setA(START); onInteract(); }} className="text-sm font-semibold text-ink/55 underline underline-offset-4">Reset to applicant A0241</button>
      </div>
      <div className="space-y-4">
        <div className={`rounded-2xl p-5 ${p >= 0.5 ? "bg-lime-soft ring-1 ring-lime-deep/20" : "bg-danger-soft"}`}>
          <p className="text-xs text-ink/55">P(repay)</p>
          <p className="font-display text-3xl font-semibold text-ink">{Math.round(p * 100)}% — {p >= 0.5 ? "approved" : "declined"}</p>
        </div>
        <p className="text-sm text-ink/60">Why: each feature pushes the score up or down from an average applicant.</p>
        <ul className="space-y-2">
          {contributions.map((c) => (
            <li key={c.name} className="grid grid-cols-[10rem_1fr_3rem] items-center gap-3 text-sm">
              <span className="truncate text-ink/70">{LABELS[c.name]}</span>
              <span className="relative h-3 rounded-full bg-ink/5">
                <span className="absolute top-0 h-3 w-px bg-ink/30" style={{ left: "50%" }} />
                <span
                  className={`absolute top-0 h-3 rounded-full ${c.value >= 0 ? "bg-lime-deep" : "bg-danger"}`}
                  style={c.value >= 0 ? { left: "50%", width: `${Math.min(50, (c.value / max) * 50)}%` } : { right: "50%", width: `${Math.min(50, (-c.value / max) * 50)}%` }}
                />
              </span>
              <span className="text-right font-mono text-xs text-ink/60">{c.value >= 0 ? "+" : ""}{c.value.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs leading-relaxed text-ink/55">
          The real model&apos;s weights. A0241 has been a customer for four years and repaid — but low recorded income and few transactions sink her score. Find the smallest change that gets her approved: that&apos;s a <em>counterfactual</em> explanation.
        </p>
      </div>
    </div>
  );
}
