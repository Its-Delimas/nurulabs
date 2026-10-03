import { Check, Code2, Sparkles } from "lucide-react";
import PythonCode from "@/components/lab/PythonCode";

const CODE = `def mean(values):
    if not values:
        return None
    return sum(values) / len(values)

prices = [62, 71, 55, 48]
average_price = mean(prices)
print("Average price:", average_price)`;

const CHECKS = ["mean() returns the right average", "mean([]) returns None", "average_price is 59"];

/** A still of a practice step, built from the lab's own visual language. */
export default function LabPreview() {
  return (
    <figure
      role="img"
      aria-label="A practice step in a Nurulabs lab: the learner writes a function in real Python, runs it, and every check passes."
      className="overflow-hidden rounded-2xl bg-paper shadow-lg ring-1 ring-ink/10"
    >
      <div aria-hidden="true">
        {/* Lab header with its step rail */}
        <div className="flex items-center justify-between gap-4 border-b border-ink/10 px-4 py-3 sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-[11px] text-ink/55">Python Essentials · Lab 19</p>
            <p className="truncate text-sm font-semibold text-ink">Functions: Reusable Recipes</p>
          </div>
          <div className="flex shrink-0 gap-1">
            {[1, 1, 1, 1, 1, 1, 2, 0, 0, 0].map((s, i) => (
              <span key={i} className={`h-1.5 w-3 rounded-full sm:w-5 ${s === 1 ? "bg-lime-deep" : s === 2 ? "bg-ink" : "bg-ink/15"}`} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          {/* The brief, the checks and the mentor */}
          <div className="p-4 sm:p-5">
            <p className="eyebrow flex items-center gap-1.5 text-lime-deep">
              <Code2 size={13} /> Practice
            </p>
            <p className="mt-1.5 font-display text-lg font-semibold text-ink">Write mean()</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/65">Return the average of a list, or None if it&apos;s empty.</p>
            <p className="eyebrow mt-5 text-[10px] text-ink/55">Checks</p>
            <ul className="mt-2 space-y-2">
              {CHECKS.map((c) => (
                <li key={c} className="flex items-center gap-2 text-[13px] text-ink">
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-lime text-onlime">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="truncate">{c}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 rounded-xl bg-cream p-3">
              <p className="eyebrow flex items-center gap-1.5 text-[10px] text-lime-deep">
                <Sparkles size={12} /> Mentor
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink/75">All three checks pass. mean() now works on any list, empty ones included.</p>
            </div>
          </div>

          {/* The editor, and what the code printed */}
          <div className="m-3 mt-0 overflow-hidden rounded-xl bg-code md:mt-3 md:ml-0">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <span className="font-mono text-[11px] text-white/55">main.py</span>
              <span className="rounded-md bg-lime px-2.5 py-1 text-[11px] font-semibold text-onlime">▶ Run</span>
            </div>
            <PythonCode code={CODE} className="rounded-none! bg-transparent! p-4! text-[12px]!" />
            <div className="border-t border-white/10 px-4 py-3 font-mono text-[12px]">
              <p className="eyebrow text-[10px] text-lime">Output</p>
              <p className="mt-1 text-white/85">Average price: 59.0</p>
            </div>
          </div>
        </div>
      </div>
    </figure>
  );
}
