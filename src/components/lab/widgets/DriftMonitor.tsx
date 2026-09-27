"use client";

import { useMemo, useState } from "react";
import { APPLICANTS, scoreApplicant } from "@/lib/curriculum/data/loan-model";
import Slider from "./Slider";

const base = APPLICANTS.map((a) => a.mobile_money_txns);
const BINS = Array.from({ length: 16 }, (_, i) => i * 5); // 0–80 in steps of 5

function hist(xs: number[]) {
  const h = BINS.map(() => 0);
  xs.forEach((x) => { h[Math.min(BINS.length - 1, Math.floor(x / 5))]++; });
  return h.map((c) => c / xs.length);
}

/** Largest gap between two empirical CDFs — the Kolmogorov–Smirnov statistic. */
function ks(a: number[], b: number[]) {
  const xs = [...new Set([...a, ...b])].sort((x, y) => x - y);
  const cdf = (s: number[], x: number) => s.filter((v) => v <= x).length / s.length;
  return Math.max(...xs.map((x) => Math.abs(cdf(a, x) - cdf(b, x))));
}

/** A cashback promotion starts: transactions climb month by month, but nobody is richer. */
export default function DriftMonitor({ onInteract }: { onInteract: () => void }) {
  const [month, setMonth] = useState(0);
  const lift = 1 + 0.12 * month;
  const { now, stat, approval, hTrain, hNow } = useMemo(() => {
    const now = base.map((x) => Math.round(x * lift));
    const approval = APPLICANTS.filter((a, i) => scoreApplicant({ ...a, mobile_money_txns: now[i] } as never).p >= 0.5).length / APPLICANTS.length;
    return { now, stat: ks(base, now), approval, hTrain: hist(base), hNow: hist(now) };
  }, [lift]);
  const alert = stat > 0.2;
  const W = 480, H = 180, bw = W / BINS.length, peak = Math.max(...hTrain, ...hNow);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <svg viewBox={`0 0 ${W} ${H + 20}`} className="w-full rounded-2xl bg-paper ring-1 ring-ink/10" role="img" aria-label="Transactions per month: training data vs this month">
          {hTrain.map((v, i) => <rect key={`t${i}`} x={i * bw + 2} y={H - (v / peak) * (H - 10)} width={bw - 4} height={(v / peak) * (H - 10)} fill="var(--color-ink)" opacity={0.18} />)}
          {hNow.map((v, i) => <rect key={`n${i}`} x={i * bw + bw * 0.3} y={H - (v / peak) * (H - 10)} width={bw * 0.4} height={(v / peak) * (H - 10)} fill="var(--color-lime-deep)" />)}
          {[0, 20, 40, 60].map((x) => <text key={x} x={(x / 5) * bw + 2} y={H + 15} className="fill-ink/50 text-[10px]">{x}</text>)}
        </svg>
        <p className="text-xs text-ink/55"><span className="inline-block h-2 w-3 bg-ink/20" /> training data &nbsp; <span className="inline-block h-2 w-3 bg-lime-deep" /> applicants this month — mobile-money transactions per month</p>
        <Slider label="months since the promotion started" value={month} min={0} max={6} onChange={(v) => { setMonth(v); onInteract(); }} />
      </div>
      <div className="space-y-3">
        <div className={`rounded-2xl p-5 ${alert ? "bg-danger-soft" : "bg-lime-soft ring-1 ring-lime-deep/20"}`}>
          <p className="text-xs text-ink/55">drift check on transactions (KS statistic)</p>
          <p className="font-display text-3xl font-semibold text-ink">{stat.toFixed(2)} {alert ? "— ALERT" : "— OK"}</p>
        </div>
        <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
          <p className="text-xs text-ink/50">share of applicants the model approves</p>
          <p className="font-mono text-xl text-ink">{Math.round(approval * 100)}%</p>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">
          Nothing about customers&apos; ability to repay has changed — only their transaction counts. The model can&apos;t know that, so approvals creep up. Monitoring input distributions catches this long before repayment data arrives. Mean now: {(now.reduce((s, x) => s + x, 0) / now.length).toFixed(1)} vs {(base.reduce((s, x) => s + x, 0) / base.length).toFixed(1)}.
        </p>
      </div>
    </div>
  );
}
