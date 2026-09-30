"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Scale, X } from "lucide-react";
import type { ScenarioStep } from "@/lib/curriculum/types";
import RichText from "../RichText";

/**
 * A judgement call: read the situation, weigh the evidence, pick what you'd do.
 * Every option explains itself when picked; the step is done once the learner
 * finds the best call (or asks to see it after two misses).
 */
export default function ScenarioView({
  step,
  done,
  onComplete,
}: {
  step: ScenarioStep;
  done: boolean;
  onComplete: () => void;
}) {
  const bestIndex = step.options.findIndex((o) => o.best);
  const [picked, setPicked] = useState<number[]>(done ? [bestIndex] : []);
  const last = picked[picked.length - 1];
  const solved = picked.includes(bestIndex);
  const misses = picked.filter((i) => i !== bestIndex).length;

  function pick(i: number) {
    if (solved || picked.includes(i)) return;
    setPicked([...picked, i]);
    if (i === bestIndex) onComplete();
  }

  return (
    <div className="grid w-full gap-10 px-6 py-12 md:px-10 md:py-16 lg:grid-cols-2 xl:px-16">
      <div>
        <div className="flex items-center gap-2 text-violet">
          <Scale size={16} />
          <p className="eyebrow">Scenario · your call</p>
        </div>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">{step.title}</h1>
        <div className="mt-4 space-y-3 text-[16px] leading-relaxed text-ink/75">
          {step.situation.map((p, i) => (
            <p key={i}>
              <RichText text={p} />
            </p>
          ))}
        </div>

        {step.exhibit && (
          <figure className="mt-6 overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/10">
            {step.exhibit.image && (
              <div className="relative aspect-[16/9]">
                <Image src={step.exhibit.image.src} alt={step.exhibit.image.alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
              </div>
            )}
            {step.exhibit.table && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink/10 bg-cream/60">
                      {step.exhibit.table.columns.map((c) => (
                        <th key={c} className="px-4 py-2.5 text-xs font-semibold text-ink/55">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {step.exhibit.table.rows.map((row, r) => (
                      <tr key={r} className="border-b border-ink/5 last:border-0">
                        {row.map((cell, c) => (
                          <td key={c} className={`px-4 py-2.5 ${typeof cell === "number" ? "font-mono tabular-nums" : ""} ${c === 0 ? "font-medium text-ink" : "text-ink/75"}`}>
                            {typeof cell === "number" ? cell.toLocaleString("en") : cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <figcaption className="border-t border-ink/10 px-4 py-2.5 text-xs text-ink/50">{step.exhibit.caption}</figcaption>
          </figure>
        )}
      </div>

      <div className="lg:pt-16">
        <p className="font-display text-lg font-semibold leading-snug text-ink">
          <RichText text={step.question} />
        </p>
        <ul className="mt-4 space-y-2.5">
          {step.options.map((opt, i) => {
            const tried = picked.includes(i);
            const isBest = i === bestIndex;
            const state = tried ? (isBest ? "best" : "miss") : solved ? "muted" : "idle";
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => pick(i)}
                  disabled={solved || tried}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-5 py-4 text-left text-[15px] leading-snug transition-colors ${
                    state === "idle"
                      ? "border-ink/10 bg-paper hover:border-ink/40"
                      : state === "best"
                        ? "border-lime-deep/30 bg-lime-soft text-ink"
                        : state === "miss"
                          ? "border-danger/25 bg-danger-soft text-ink/80"
                          : "border-ink/5 bg-paper/60 text-ink/40"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                      state === "best" ? "bg-lime-deep text-paper" : state === "miss" ? "bg-danger text-paper" : "bg-cream text-ink/50"
                    }`}
                  >
                    {state === "best" ? <Check size={12} strokeWidth={3} /> : state === "miss" ? <X size={12} strokeWidth={3} /> : String.fromCharCode(65 + i)}
                  </span>
                  <span className="min-w-0">
                    <RichText text={opt.text} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {tried && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="overflow-hidden px-5 pt-2 text-sm leading-relaxed text-ink/65"
                    >
                      <RichText text={opt.feedback} />
                    </motion.p>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>

        {!solved && misses > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink/55">
            <span>{last !== undefined && last !== bestIndex ? "Not the best call. Read why, then try another." : ""}</span>
            {misses >= 2 && (
              <button type="button" onClick={() => pick(bestIndex)} className="font-semibold text-ink underline underline-offset-4">
                Show me the best call
              </button>
            )}
          </div>
        )}

        {solved && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 rounded-3xl bg-paper p-6 ring-1 ring-ink/10">
            <p className="eyebrow text-violet">How a professional thinks about it</p>
            <p className="mt-3 text-[15px] leading-relaxed text-ink/80">
              <RichText text={step.debrief} />
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
