"use client";

import { useState } from "react";

interface Commit { id: string; msg: string; branch: string; parents: string[] }

const hex = (n: number) => ((n * 2654435761) >>> 0).toString(16).padStart(8, "0").slice(0, 7);

/** Edit, stage, commit, branch and merge — and watch the history graph grow. */
export default function GitSimulator({ onInteract }: { onInteract: () => void }) {
  const [commits, setCommits] = useState<Commit[]>([{ id: hex(1), msg: "Initial commit", branch: "main", parents: [] }]);
  const [heads, setHeads] = useState<Record<string, string>>({ main: hex(1) });
  const [branch, setBranch] = useState("main");
  const [changed, setChanged] = useState(false);
  const [staged, setStaged] = useState(false);
  const [log, setLog] = useState<string[]>(["$ git init"]);
  const n = commits.length;

  const act = (cmd: string, fn: () => void) => { fn(); setLog((l) => [...l, `$ ${cmd}`].slice(-7)); onInteract(); };

  const edit = () => act("# edit analysis.py", () => { setChanged(true); setStaged(false); });
  const add = () => act("git add analysis.py", () => { if (changed) setStaged(true); });
  const commit = () => act(`git commit -m "Update analysis (${n})"`, () => {
    if (!staged) return;
    const id = hex(n + 1);
    setCommits((c) => [...c, { id, msg: `Update analysis (${n})`, branch, parents: [heads[branch]] }]);
    setHeads((h) => ({ ...h, [branch]: id }));
    setChanged(false); setStaged(false);
  });
  const newBranch = () => act("git switch -c add-chart", () => {
    if (heads["add-chart"]) { setBranch("add-chart"); return; }
    setHeads((h) => ({ ...h, "add-chart": h[branch] })); setBranch("add-chart");
  });
  const toMain = () => act("git switch main", () => setBranch("main"));
  const merge = () => act("git merge add-chart", () => {
    if (branch !== "main" || !heads["add-chart"] || heads["add-chart"] === heads.main) return;
    const id = hex(n + 1);
    setCommits((c) => [...c, { id, msg: "Merge branch 'add-chart'", branch: "main", parents: [heads.main, heads["add-chart"]] }]);
    setHeads((h) => ({ ...h, main: id }));
  });

  const lane = (b: string) => (b === "main" ? 40 : 110);
  const pos = Object.fromEntries(commits.map((c, i) => [c.id, { x: 90 + i * 64, y: lane(c.branch) }]));
  const W = Math.max(420, 130 + commits.length * 64);
  const btn = "rounded-md px-3 py-1.5 text-xs font-semibold ring-1 ring-ink/15 text-ink disabled:opacity-35";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={edit} className={btn}>1. Edit a file</button>
        <button type="button" onClick={add} disabled={!changed || staged} className={btn}>2. git add</button>
        <button type="button" onClick={commit} disabled={!staged} className={btn}>3. git commit</button>
        <button type="button" onClick={newBranch} disabled={branch === "add-chart"} className={btn}>git switch -c add-chart</button>
        <button type="button" onClick={toMain} disabled={branch === "main"} className={btn}>git switch main</button>
        <button type="button" onClick={merge} disabled={branch !== "main" || !heads["add-chart"] || heads["add-chart"] === heads.main} className={btn}>git merge add-chart</button>
      </div>
      <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
        <svg viewBox={`0 0 ${W} 150`} style={{ width: W }} className="h-[150px]" role="img" aria-label="Commit history graph">
          <text x={8} y={44} className="fill-ink/40 text-[10px]">main</text>
          {heads["add-chart"] && <text x={8} y={114} className="fill-ink/40 text-[10px]">add-chart</text>}
          {commits.flatMap((c) => c.parents.map((p) => <line key={c.id + p} x1={pos[p].x} y1={pos[p].y} x2={pos[c.id].x} y2={pos[c.id].y} stroke="var(--color-ink)" strokeOpacity={0.3} strokeWidth={2} />))}
          {commits.map((c) => (
            <g key={c.id}>
              <circle cx={pos[c.id].x} cy={pos[c.id].y} r={9} fill={Object.values(heads).includes(c.id) ? "var(--color-lime-deep)" : "var(--color-ink)"} opacity={0.85} />
              <text x={pos[c.id].x} y={pos[c.id].y + 24} textAnchor="middle" className="fill-ink/55 font-mono text-[9px]">{c.id}</text>
            </g>
          ))}
        </svg>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <pre className="rounded-2xl bg-code p-3 font-mono text-[11px] leading-5 text-white/85">{log.join("\n")}</pre>
        <div className="rounded-2xl bg-cream p-4 text-xs leading-relaxed text-ink/70">
          <p>On branch <strong className="font-mono">{branch}</strong>. Working copy: {staged ? "change staged, ready to commit" : changed ? "file edited, not staged" : "clean"}.</p>
          <p className="mt-2">Each dot is a commit: a saved snapshot with a unique ID (in real Git, a hash of its content). A branch is just a label pointing at one commit; merging joins two histories.</p>
        </div>
      </div>
    </div>
  );
}
