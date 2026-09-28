"use client";

import { useState } from "react";

const PROJECTS = [
  { name: "old_report/", needs: "pandas==1.5.3", note: "last year's county report, written for pandas 1" },
  { name: "new_model/", needs: "pandas==2.2.2", note: "this year's ML project, needs pandas 2" },
];

type Os = "windows" | "unix";

/** Two projects, two pandas versions: one shared install vs a virtual environment each. */
export default function VenvExplorer({ onInteract }: { onInteract: () => void }) {
  const [venvs, setVenvs] = useState(false);
  const [lastInstalled, setLastInstalled] = useState(1);
  const [os, setOs] = useState<Os>("windows");

  const works = (i: number) => venvs || i === lastInstalled;
  const activate = os === "windows" ? ".venv\\Scripts\\activate" : "source .venv/bin/activate";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl bg-ink/5 p-1">
          {[false, true].map((v) => (
            <button key={String(v)} type="button" onClick={() => { setVenvs(v); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${venvs === v ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
              {v ? "one virtual environment per project" : "everything installed globally"}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-xl bg-ink/5 p-1">
          {(["windows", "unix"] as Os[]).map((o) => (
            <button key={o} type="button" onClick={() => { setOs(o); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${os === o ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
              {o === "windows" ? "Windows" : "macOS / Linux"}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {PROJECTS.map((p, i) => (
          <div key={p.name} className={`space-y-3 rounded-2xl p-5 ring-1 ${works(i) ? "bg-paper ring-ink/10" : "bg-danger-soft ring-danger/20"}`}>
            <p className="font-mono text-sm font-semibold text-ink">{p.name}</p>
            <p className="text-xs text-ink/55">{p.note} — needs <code>{p.needs}</code></p>
            <pre className="overflow-x-auto rounded-xl bg-code p-3 font-mono text-[11px] leading-5 text-white/85">{venvs
              ? `cd ${p.name}\npython -m venv .venv\n${activate}\npip install ${p.needs}`
              : `pip install ${p.needs}`}</pre>
            {!venvs && (
              <button type="button" onClick={() => { setLastInstalled(i); onInteract(); }} className="rounded-md border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink">Run this install</button>
            )}
            <p className={`text-sm font-semibold ${works(i) ? "text-lime-deep" : "text-danger"}`}>
              {works(i) ? "✓ runs" : `✗ breaks — the global pandas is now ${PROJECTS[lastInstalled].needs.split("==")[1]}`}
            </p>
          </div>
        ))}
      </div>
      <p className="text-xs leading-relaxed text-ink/55">Globally there is only one pandas, so installing for one project breaks the other. A virtual environment (<code>.venv</code>) is a private folder of packages for one project; activate it, and <code>pip</code> and <code>python</code> use only that folder.</p>
    </div>
  );
}
