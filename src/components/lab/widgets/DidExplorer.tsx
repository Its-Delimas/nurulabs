"use client";

import { useState } from "react";

// Monthly immunisation coverage (%), Jan 2022 – Dec 2024, from the lab's immunisation.csv.
const MACHAKOS = [73.0, 69.7, 73.6, 73.1, 73.2, 72.9, 70.3, 71.3, 70.2, 74.3, 71.7, 72.1, 73.4, 74.2, 74.8, 75.9, 76.7, 75.5, 80.9, 79.0, 78.7, 80.2, 79.7, 79.6, 81.1, 83.0, 85.4, 83.7, 83.6, 84.4, 81.7, 81.5, 82.2, 81.8, 81.8, 83.4];
const MAKUENI = [73.2, 78.2, 77.2, 77.0, 78.9, 78.8, 76.9, 75.5, 76.1, 75.9, 77.9, 78.2, 78.8, 81.0, 80.6, 80.4, 81.8, 81.3, 79.7, 78.4, 78.9, 76.1, 79.8, 80.6, 79.6, 82.6, 82.5, 84.7, 81.9, 82.5, 83.3, 83.0, 79.1, 80.8, 82.1, 82.1];
const START = 18; // July 2023

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
const before = (a: number[]) => mean(a.slice(0, START));
const after = (a: number[]) => mean(a.slice(START));

type View = "before-after" | "comparison" | "did";

/** Did the programme raise immunisation — or was everyone rising anyway? */
export default function DidExplorer({ onInteract }: { onInteract: () => void }) {
  const [view, setView] = useState<View>("before-after");
  const W = 540, H = 220, lo = 66, hi = 88;
  const x = (i: number) => (i / (MACHAKOS.length - 1)) * W;
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H;
  const path = (a: number[]) => a.map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`).join(" ");
  const machChange = after(MACHAKOS) - before(MACHAKOS);
  const makChange = after(MAKUENI) - before(MAKUENI);
  const did = machChange - makChange;
  const counterfactual = before(MACHAKOS) + makChange;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="w-full rounded-2xl bg-paper ring-1 ring-ink/10" role="img" aria-label="Immunisation coverage in two counties over time">
        <rect x={x(START)} y={0} width={W - x(START)} height={H} fill="var(--color-lime-soft)" opacity={0.5} />
        <text x={x(START) + 6} y={14} className="fill-ink/60 text-[10px]">programme starts in Machakos</text>
        {view !== "before-after" && <path d={path(MAKUENI)} fill="none" stroke="var(--color-ink)" strokeOpacity={0.35} strokeWidth={2} />}
        <path d={path(MACHAKOS)} fill="none" stroke="var(--color-lime-deep)" strokeWidth={2.5} />
        <line x1={0} x2={x(START)} y1={y(before(MACHAKOS))} y2={y(before(MACHAKOS))} stroke="var(--color-lime-deep)" strokeDasharray="4 3" />
        <line x1={x(START)} x2={W} y1={y(after(MACHAKOS))} y2={y(after(MACHAKOS))} stroke="var(--color-lime-deep)" strokeDasharray="4 3" />
        {view === "did" && <line x1={x(START)} x2={W} y1={y(counterfactual)} y2={y(counterfactual)} stroke="var(--color-danger)" strokeWidth={2} strokeDasharray="6 4" />}
        <line x1={W - 150} x2={W - 132} y1={H - 30} y2={H - 30} stroke="var(--color-lime-deep)" strokeWidth={2.5} />
        <text x={W - 126} y={H - 26} className="fill-ink/70 text-[11px]">Machakos (programme)</text>
        {view !== "before-after" && (
          <>
            <line x1={W - 150} x2={W - 132} y1={H - 14} y2={H - 14} stroke="var(--color-ink)" strokeOpacity={0.35} strokeWidth={2} />
            <text x={W - 126} y={H - 10} className="fill-ink/70 text-[11px]">Makueni (no programme)</text>
          </>
        )}
        {["2022", "2023", "2024"].map((yr, i) => <text key={yr} x={x(i * 12) + 4} y={H + 16} className="fill-ink/50 text-[10px]">{yr}</text>)}
      </svg>
      <div className="space-y-4">
        <div className="flex flex-col gap-1.5">
          {([["before-after", "1. Machakos before vs after"], ["comparison", "2. Add neighbouring Makueni"], ["did", "3. Difference-in-differences"]] as [View, string][]).map(([v, label]) => (
            <button key={v} type="button" onClick={() => { setView(v); onInteract(); }} className={`rounded-lg px-3 py-2 text-left text-sm font-semibold ring-1 ${view === v ? "bg-ink text-paper ring-ink" : "text-ink/60 ring-ink/15"}`}>{label}</button>
          ))}
        </div>
        <div className="rounded-2xl bg-paper p-4 font-mono text-sm ring-1 ring-ink/10">
          <p>Machakos change: <strong>{machChange >= 0 ? "+" : ""}{machChange.toFixed(1)}</strong> pts</p>
          {view !== "before-after" && <p className="text-ink/60">Makueni change: {makChange >= 0 ? "+" : ""}{makChange.toFixed(1)} pts</p>}
          {view === "did" && <p className="mt-2 text-lime-deep">Estimated effect: <strong>+{did.toFixed(1)}</strong> pts</p>}
        </div>
        <p className="text-xs leading-relaxed text-ink/55">
          {view === "before-after" && "Coverage rose after the programme — but it was already rising before it."}
          {view === "comparison" && "Makueni, with no programme, also rose. Part of Machakos' rise would have happened anyway."}
          {view === "did" && "The red line is what Machakos would likely have reached without the programme: its old level plus Makueni's rise. The gap above it is the programme's estimated effect — if both counties would otherwise have moved in parallel."}
        </p>
      </div>
    </div>
  );
}
