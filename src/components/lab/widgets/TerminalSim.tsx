"use client";

import { useRef, useState } from "react";

// A tiny simulated terminal on a pretend laptop — no real system is touched.
type Dir = { [name: string]: Dir | string };
const START: Dir = {
  Documents: { "notes.txt": "Buy maize seed" },
  projects: { "hello.py": 'print("Habari, dunia!")', "prices.csv": "market,price\nKisumu,3900" },
};

const HELP = "Try: pwd, ls, cd projects, ls, python hello.py, python --version, mkdir my_app, cd .., clear";

/** Practise the handful of commands you'll type every day. */
export default function TerminalSim({ onInteract }: { onInteract: () => void }) {
  const [fs, setFs] = useState<Dir>(START);
  const [cwd, setCwd] = useState<string[]>([]);
  const [lines, setLines] = useState<string[]>(["Welcome! This is a practice terminal. " + HELP]);
  const [input, setInput] = useState("");
  const box = useRef<HTMLDivElement>(null);

  const dirAt = (path: string[]) => path.reduce<Dir | undefined>((d, p) => (d && typeof d[p] === "object" ? (d[p] as Dir) : undefined), fs);
  const prompt = `amina@laptop:~${cwd.length ? "/" + cwd.join("/") : ""}$`;

  function run(cmd: string) {
    const [name, ...args] = cmd.trim().split(/\s+/);
    const here = dirAt(cwd)!;
    let out: string[] = [];
    if (!name) out = [];
    else if (name === "pwd") out = ["/home/amina" + (cwd.length ? "/" + cwd.join("/") : "")];
    else if (name === "ls" || name === "dir") out = [Object.keys(here).map((k) => (typeof here[k] === "object" ? k + "/" : k)).join("   ") || "(empty)"];
    else if (name === "cd") {
      const target = args[0];
      if (!target || target === "~") setCwd([]);
      else if (target === "..") setCwd(cwd.slice(0, -1));
      else if (typeof here[target] === "object") setCwd([...cwd, target]);
      else out = [`cd: no such directory: ${target}`];
    } else if (name === "mkdir" && args[0]) {
      const copy = structuredClone(fs);
      const d = cwd.reduce<Dir>((acc, p) => acc[p] as Dir, copy);
      d[args[0]] = {};
      setFs(copy);
    } else if (name === "cat" && args[0]) out = [typeof here[args[0]] === "string" ? (here[args[0]] as string) : `cat: ${args[0]}: No such file`];
    else if ((name === "python" || name === "python3") && args[0] === "--version") out = ["Python 3.12.4"];
    else if (name === "python" || name === "python3") {
      const file = here[args[0] ?? ""];
      if (!args[0]) out = ["(The interactive Python prompt opens here: >>>. Type exit() to leave.)"];
      else if (typeof file !== "string") out = [`python: can't open file '${args[0]}': [Errno 2] No such file or directory`];
      else if (args[0].endsWith(".py")) out = [(file.match(/print\("(.*)"\)/) ?? ["", "(runs the script)"])[1]];
      else out = ["That isn't a Python script."];
    } else if (name === "clear") { setLines([]); return; }
    else if (name === "help") out = [HELP];
    else out = [`${name}: command not found. ${HELP}`];
    setLines((ls) => [...ls, `${prompt} ${cmd}`, ...out]);
    onInteract();
    setTimeout(() => box.current?.scrollTo(0, box.current.scrollHeight), 0);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-2xl bg-code">
        <div ref={box} className="h-72 overflow-y-auto p-4 font-mono text-xs leading-6 text-white/85">
          {lines.map((l, i) => <div key={i} className="whitespace-pre-wrap">{l}</div>)}
          <form onSubmit={(e) => { e.preventDefault(); run(input); setInput(""); }} className="flex gap-2">
            <span className="shrink-0 text-lime">{prompt}</span>
            <input value={input} onChange={(e) => setInput(e.target.value)} aria-label="Terminal command" autoComplete="off" spellCheck={false} className="min-w-0 flex-1 bg-transparent text-white outline-none" />
          </form>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        {[
          ["pwd", "where am I?"],
          ["ls  (Windows: dir)", "what's in this folder?"],
          ["cd projects / cd ..", "go into a folder / go up one"],
          ["mkdir my_app", "make a new folder"],
          ["python hello.py", "run a Python script"],
          ["python --version", "which Python is installed?"],
        ].map(([c, d]) => (
          <button key={c} type="button" onClick={() => run(c.split("  ")[0].split(" / ")[0])} className="flex w-full items-center justify-between gap-3 rounded-xl bg-paper px-4 py-2 text-left ring-1 ring-ink/10 hover:ring-ink/30">
            <code className="font-mono text-xs text-ink">{c}</code>
            <span className="text-xs text-ink/50">{d}</span>
          </button>
        ))}
        <p className="pt-1 text-xs leading-relaxed text-ink/55">A practice terminal — nothing here touches a real computer. On Windows the same commands work in PowerShell (with <code>dir</code> as well as <code>ls</code>).</p>
      </div>
    </div>
  );
}
