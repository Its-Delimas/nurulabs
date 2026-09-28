"use client";

import { useState } from "react";

const CELLS = [
  { code: 'price = 3900\nprint("price set")', run: (s: State) => ({ ...s, price: 3900, out: "price set" }) },
  { code: "price = price * 1.10   # add 10% transport", run: (s: State) => (s.price === undefined ? { ...s, out: "NameError: name 'price' is not defined" } : { ...s, price: Math.round(s.price * 1.1), out: "" }) },
  { code: 'print(f"Sell at KSh {price}")', run: (s: State) => (s.price === undefined ? { ...s, out: "NameError: name 'price' is not defined" } : { ...s, out: `Sell at KSh ${s.price}` }) },
];

type State = { price?: number; out: string };

/** Notebook cells share memory — and run in whatever order you click them. */
export default function NotebookOrder({ onInteract }: { onInteract: () => void }) {
  const [state, setState] = useState<State>({ out: "" });
  const [counts, setCounts] = useState<(number | null)[]>([null, null, null]);
  const [outs, setOuts] = useState<string[]>(["", "", ""]);
  const [n, setN] = useState(1);

  function runCell(i: number) {
    const next = CELLS[i].run(state);
    setState(next);
    setCounts((c) => c.map((v, k) => (k === i ? n : v)));
    setOuts((o) => o.map((v, k) => (k === i ? next.out : v)));
    setN(n + 1);
    onInteract();
  }
  const restart = () => { setState({ out: "" }); setCounts([null, null, null]); setOuts(["", "", ""]); setN(1); onInteract(); };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        {CELLS.map((c, i) => (
          <div key={i} className="grid grid-cols-[3.5rem_1fr] gap-2">
            <button type="button" onClick={() => runCell(i)} className="h-fit rounded-md bg-ink px-2 py-1.5 font-mono text-[11px] text-paper" aria-label={`Run cell ${i + 1}`}>▶ [{counts[i] ?? " "}]</button>
            <div className="overflow-hidden rounded-xl ring-1 ring-ink/10">
              <pre className="bg-code px-3 py-2 font-mono text-xs leading-5 text-white/90">{c.code}</pre>
              {outs[i] && <pre className={`px-3 py-2 font-mono text-xs ${outs[i].startsWith("NameError") ? "bg-danger-soft text-danger" : "bg-paper text-ink"}`}>{outs[i]}</pre>}
            </div>
          </div>
        ))}
        <button type="button" onClick={restart} className="rounded-md border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink">Kernel → Restart &amp; clear</button>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
          <p className="text-xs text-ink/50">variable <code>price</code> in memory</p>
          <p className="font-mono text-2xl text-ink">{state.price ?? "—"}</p>
        </div>
        <p className="text-xs leading-relaxed text-ink/55">
          The numbers in brackets show the order cells actually ran. Run cell 2 twice and the price grows twice — but the notebook still <em>looks</em> right. That hidden state is the most common notebook bug. Before sharing a notebook, restart and run all cells from top to bottom.
        </p>
      </div>
    </div>
  );
}
