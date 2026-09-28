"use client";

import { useState } from "react";
import Slider from "./Slider";

// Rows loaded per night, 1 April – 29 June 2024 (pipeline_runs.csv).
const ROWS = [179535, 188574, 175224, 171609, 190944, 145350, 134704, 186887, 184069, 181267, 183188, 170525, 146734, 140053, 179547, 175234, 181597, 192402, 177826, 143403, 144018, 182250, 190101, 195038, 181364, 191170, 142926, 145562, 189449, 187843, 184092, 197349, 198442, 71900, 152770, 198084, 196730, 204717, 193537, 191487, 153587, 158538, 189142, 192339, 200185, 206667, 200233, 152586, 157037, 189916, 194441, 193528, 203373, 203623, 161674, 154552, 199823, 409787, 195278, 201799, 204710, 154191, 158537, 213429, 200545, 207013, 197446, 209649, 158642, 166057, 206564, 207103, 189555, 214283, 215791, 165349, 164986, 207615, 207299, 218810, 209527, 213999, 0, 162367, 209722, 217631, 220445, 225796, 225800, 160893];
const INCIDENTS = new Set([33, 57, 82]); // half load, double load, empty load
const START = Date.UTC(2024, 3, 1);

type Method = "yesterday" | "mean7" | "weekday";
const METHODS: Record<Method, string> = {
  yesterday: "vs yesterday",
  mean7: "vs 7-day average",
  weekday: "vs same weekday (4-week median)",
};

function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  return (s[1] + s[2]) / 2; // always four values here
}

function baseline(method: Method, i: number): number | null {
  if (method === "yesterday") return i >= 1 ? ROWS[i - 1] : null;
  if (method === "mean7") return i >= 7 ? ROWS.slice(i - 7, i).reduce((a, b) => a + b) / 7 : null;
  return i >= 28 ? median([1, 2, 3, 4].map((k) => ROWS[i - 7 * k])) : null;
}

const day = (i: number) => new Date(START + i * 86400000).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

/** Flag unusual daily row counts against different baselines. */
export default function VolumeMonitor({ onInteract }: { onInteract: () => void }) {
  const [method, setMethod] = useState<Method>("yesterday");
  const [threshold, setThreshold] = useState(20);
  const [hover, setHover] = useState<number | null>(null);

  const alerts = ROWS.map((v, i) => {
    const b = baseline(method, i);
    if (!b) return null;
    const r = v / b;
    return r < 1 - threshold / 100 || r > 1 + threshold / 100;
  });
  const caught = [...INCIDENTS].filter((i) => alerts[i]).length;
  const falseAlarms = alerts.filter((a, i) => a && !INCIDENTS.has(i)).length;
  const max = Math.max(...ROWS);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(METHODS) as Method[]).map((m) => (
          <button key={m} type="button" onClick={() => { setMethod(m); onInteract(); }} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${method === m ? "bg-ink text-paper ring-ink" : "text-ink/60 ring-ink/15"}`}>
            {METHODS[m]}
          </button>
        ))}
      </div>
      <div className="max-w-md">
        <Slider label="alert when a day differs from its baseline by more than" value={threshold} min={10} max={70} step={5} format={(v) => `${v}%`} onChange={(v) => { setThreshold(v); onInteract(); }} />
      </div>

      <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
        <div className="flex h-40 items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
          {ROWS.map((v, i) => (
            <div key={i} className="relative flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)}>
              <div
                className={`w-full rounded-t-[2px] ${alerts[i] ? "bg-danger" : alerts[i] === null ? "bg-ink/15" : "bg-lime-deep/70"}`}
                style={{ height: `${Math.max(1.5, (v / max) * 100)}%` }}
              />
              {INCIDENTS.has(i) && <span className="absolute -bottom-3 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sun" />}
            </div>
          ))}
        </div>
        <p className="mt-5 font-mono text-xs text-ink/55">
          {hover === null ? "hover a bar · grey = no baseline yet · orange dot = a real incident" : `${day(hover)}: ${ROWS[hover].toLocaleString()} rows${baseline(method, hover) ? ` · baseline ${Math.round(baseline(method, hover)!).toLocaleString()}` : ""}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <div className={`rounded-2xl p-3 ring-1 ${caught === 3 ? "bg-lime-soft ring-lime-deep/20" : "bg-danger-soft ring-danger/20"}`}>
          <p className="text-xs text-ink/55">incidents caught</p>
          <p className="font-display text-2xl font-semibold text-ink">{caught} / 3</p>
        </div>
        <div className={`rounded-2xl p-3 ring-1 ${falseAlarms === 0 ? "bg-lime-soft ring-lime-deep/20" : "bg-danger-soft ring-danger/20"}`}>
          <p className="text-xs text-ink/55">false alarms</p>
          <p className="font-display text-2xl font-semibold text-ink">{falseAlarms}</p>
        </div>
      </div>
    </div>
  );
}
