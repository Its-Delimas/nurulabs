"use client";

import { useState } from "react";

const TESTS = [
  { id: "t1", code: 'isinstance(parse_price("3400"), float)' },
  { id: "t2", code: 'parse_price("3400") == 3400' },
  { id: "t3", code: 'parse_price("KSh 3,400") == 3400' },
  { id: "t4", code: 'to_per_bag(48.5, "kg") == 4365' },
  { id: "t5", code: 'to_per_bag(3400, "90kg bag") == 3400' },
  { id: "t6", code: 'to_per_bag(48.51, "kg") == 4366' },
];

// Which tests fail on each buggy version (checked by running them in Python).
const MUTANTS = [
  { name: "forgets to remove commas", code: 'float(text.replace("KSh", ""))', killedBy: ["t3"] },
  { name: "forgets to remove “KSh”", code: 'float(text.replace(",", ""))', killedBy: ["t3"] },
  { name: "ignores the kg unit", code: "return price", killedBy: ["t4", "t6"] },
  { name: "wrong factor (100 not 90)", code: "price * 100 if unit == \"kg\" else price", killedBy: ["t4", "t6"] },
  { name: "converts bag prices too", code: "round(price * 90)", killedBy: ["t5"] },
  { name: "truncates instead of rounding", code: "int(price * 90) if unit == \"kg\" else price", killedBy: ["t6"] },
];

/** Pick tests and see which deliberately broken versions they catch. */
export default function TestMutants({ onInteract }: { onInteract: () => void }) {
  const [chosen, setChosen] = useState<Set<string>>(new Set(["t1", "t2"]));
  const killed = MUTANTS.map((m) => m.killedBy.some((t) => chosen.has(t)));
  const score = killed.filter(Boolean).length;

  function toggle(id: string) {
    const next = new Set(chosen);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setChosen(next);
    onInteract();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-ink">Your test suite</p>
        {TESTS.map((t) => (
          <label key={t.id} className={`flex items-center gap-3 rounded-xl px-3 py-2 ring-1 ${chosen.has(t.id) ? "bg-paper ring-ink/25" : "ring-ink/10"}`}>
            <input type="checkbox" checked={chosen.has(t.id)} onChange={() => toggle(t.id)} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
            <code className="font-mono text-xs text-ink">assert {t.code}</code>
          </label>
        ))}
        <p className="text-xs text-ink/55">All six tests pass on the correct code. The question is what they catch.</p>
      </div>
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-semibold text-ink">Mutants (bugs)</p>
          <p className="font-display text-lg font-semibold text-ink">{score} / {MUTANTS.length} caught</p>
        </div>
        {MUTANTS.map((m, i) => (
          <div key={m.name} className={`rounded-xl px-3 py-2 ring-1 ${killed[i] ? "bg-lime-soft ring-lime-deep/30" : "bg-danger-soft ring-danger/20"}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-ink">{m.name}</p>
              <span className={`text-xs font-semibold ${killed[i] ? "text-lime-deep" : "text-danger"}`}>{killed[i] ? "caught" : "survives"}</span>
            </div>
            <code className="font-mono text-[11px] text-ink/55">{m.code}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
