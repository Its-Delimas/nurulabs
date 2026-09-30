"use client";

import { useState } from "react";
import Slider from "./Slider";

// Payments as [event minute, arrival minute] after 12:00. Three are delayed.
const EVENTS: [number, number][] = [
  [0.4, 0.5], [1.2, 1.3], [2.1, 2.2], [3.5, 7.2], [4.1, 4.2], [4.8, 5.1], [5.6, 5.7],
  [6.3, 6.4], [6.8, 11.9], [7.0, 7.1], [8.2, 8.3], [9.4, 12.6], [9.7, 9.8], [10.5, 10.6],
  [11.3, 11.4], [12.2, 12.3], [13.1, 13.2], [14.0, 14.1], [14.6, 16.0],
];
const SIZE = 5;
const DELAYED = new Set([3, 8, 11]);
type Mode = "arrival" | "event";

const clock = (m: number) => `12:${String(Math.floor(m)).padStart(2, "0")}:${String(Math.round((m % 1) * 60)).padStart(2, "0")}`;

type Result = { start: number; ids: number[]; published: number | null };

function run(mode: Mode, lateness: number) {
  const order = EVENTS.map((e, i) => i).sort((a, b) => EVENTS[a][1] - EVENTS[b][1]);
  const windows = new Map<number, Result>();
  const late: number[] = [];
  let maxEvent = -Infinity;
  for (const i of order) {
    const [ev, arr] = EVENTS[i];
    const start = Math.floor((mode === "event" ? ev : arr) / SIZE) * SIZE;
    const w = windows.get(start);
    if (w?.published != null) {
      late.push(i);
      continue;
    }
    if (!w) windows.set(start, { start, ids: [i], published: null });
    else w.ids.push(i);
    if (mode === "event") {
      maxEvent = Math.max(maxEvent, ev);
      for (const win of windows.values()) {
        if (win.published == null && maxEvent - lateness >= win.start + SIZE) win.published = arr;
      }
    }
  }
  return { windows: [...windows.values()].sort((a, b) => a.start - b.start), late };
}

/** Tumbling windows by arrival vs event time, with a watermark for stragglers. */
export default function StreamWindows({ onInteract }: { onInteract: () => void }) {
  const [mode, setMode] = useState<Mode>("arrival");
  const [lateness, setLateness] = useState(0);
  const { windows, late } = run(mode, lateness);
  const truth = [0, 5, 10].map((s) => EVENTS.filter(([ev]) => ev >= s && ev < s + SIZE).length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-6">
        <div className="inline-flex rounded-xl bg-ink/5 p-1">
          {(["arrival", "event"] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => { setMode(m); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${mode === m ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
              window by {m} time
            </button>
          ))}
        </div>
        {mode === "event" && (
          <div className="w-64">
            <Slider label="allowed lateness" value={lateness} min={0} max={4} step={0.5} format={(v) => `${v} min`} onChange={(v) => { setLateness(v); onInteract(); }} />
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {windows.map((w) => {
          const correct = mode === "event" && w.start < 15 ? truth[w.start / SIZE] : null;
          return (
            <div key={w.start} className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
              <p className="font-mono text-xs text-ink/50">{clock(w.start)}–{clock(w.start + SIZE)}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">{w.ids.length} <span className="text-sm font-normal text-ink/45">payments</span></p>
              <div className="mt-2 flex flex-wrap gap-1">
                {w.ids.map((i) => <span key={i} title={`happened ${clock(EVENTS[i][0])}, arrived ${clock(EVENTS[i][1])}`} className={`h-2.5 w-2.5 rounded-full ${DELAYED.has(i) ? "bg-sun" : "bg-lime-deep"}`} />)}
              </div>
              <p className="mt-2 text-xs text-ink/55">
                {mode === "arrival" ? "published as soon as the window's clock time ends" : w.published != null ? `published at ${clock(w.published)}` : "published when the stream ends"}
              </p>
              {correct !== null && correct !== w.ids.length && <p className="mt-1 text-xs font-semibold text-danger">really {correct} happened in this window</p>}
            </div>
          );
        })}
      </div>

      <div className={`rounded-2xl p-4 text-sm ${mode === "arrival" ? "bg-danger-soft text-danger" : late.length ? "bg-sun/15 text-ink" : "bg-lime-soft text-ink ring-1 ring-lime-deep/20"}`}>
        {mode === "arrival"
          ? `Counted by arrival, windows hold ${windows.map((w) => w.ids.length).join(" / ")}, but by when they happened the payments were ${truth.join(" / ")}. The delayed payments (orange) sit in the wrong windows.`
          : late.length
            ? `${late.length} late: ${late.map((i) => `the ${clock(EVENTS[i][0])} payment arrived at ${clock(EVENTS[i][1])}, after its window was closed`).join("; ")}.`
            : "Every payment is in the window it happened in. The price: each window waits longer before it is published."}
      </div>
      <p className="text-xs text-ink/50">Orange dots are the three delayed payments. The watermark is the latest event time seen minus the allowed lateness; a window is published once the watermark passes its end.</p>
    </div>
  );
}
