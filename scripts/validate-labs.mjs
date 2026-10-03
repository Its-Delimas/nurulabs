// Validates every lab in the same Pyodide runtime and harness the browser
// uses (public/nl_harness.py):
//   - code steps: the starter must NOT pass all checks; the solution must pass all
//   - predict steps: the marked answer must match what the code really prints
//   - explain steps: the model answer must cover every key idea
//   - scenario steps: exactly one best option, and feedback on every option
//   - runnable lesson samples: run cleanly, or raise exactly the error they demonstrate
//   - visualiser experiments: the code steps through to the end without an error
//   - playground experiments: the setup runs and every goal can be met
//   - parsons puzzles: the reference order passes every check, an empty program doesn't
//   - trace tables: the code runs and gives at least two rows of plain values
//   - find the bug: the marked line exists and the code is valid Python
// Run with `npm run validate:labs`. Exits non-zero on any failure.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { loadPyodide } = await import(path.join(root, "public/pyodide/pyodide.mjs"));
const labs = JSON.parse(readFileSync(path.join(root, ".labs-build/labs.json"), "utf8"));
const only = process.argv[2];

let out = [];
const py = await loadPyodide({
  indexURL: path.join(root, "public/pyodide/"),
  packageBaseUrl: "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/",
  stdout: (s) => out.push(s),
  stderr: () => {},
});
py.runPython(readFileSync(path.join(root, "public/nl_harness.py"), "utf8"));
py.runPython(readFileSync(path.join(root, "public/nl_trace.py"), "utf8"));
py.runPython(readFileSync(path.join(root, "public/nl_play.py"), "utf8"));
const prepared = new Set();

// Same self-hosted wheels as public/pyodide-worker.js.
const WHEELS = {
  openpyxl: ["et_xmlfile-2.0.0-py3-none-any.whl", "openpyxl-3.1.5-py2.py3-none-any.whl"],
};

async function prepare(packages = []) {
  const missing = packages.filter((p) => !prepared.has(p));
  if (!missing.length) return;
  const sources = missing.flatMap((p) => (WHEELS[p] ? WHEELS[p].map((w) => path.join(root, "public/wheels", w)) : [p]));
  const failures = [];
  await py.loadPackage(sources, { messageCallback: () => {}, errorCallback: (m) => failures.push(m) });
  if (failures.length) throw new Error(`Couldn't load ${missing.join(", ")}: ${failures.join(" ")}`);
  py.globals.get("_nl_prepare")(py.toPy(missing));
  missing.forEach((p) => prepared.add(p));
}

// Same as writeFiles() in public/pyodide-worker.js: "pkg/mod.py" goes inside a folder.
function writeLabFile(name, content) {
  if (name.includes("/")) py.FS.mkdirTree(`${py.FS.cwd()}/${name.slice(0, name.lastIndexOf("/"))}`);
  py.FS.writeFile(name, content);
}

// A lab's files, written into the sandbox before each run, as the worker does.
function writeLabFiles(files) {
  for (const [name, source] of Object.entries(files ?? {})) {
    // Datasets are published under /data/ (see scripts/export-data.mjs).
    const content = /^\/(data|datasets|notebooks)\//.test(source) ? readFileSync(path.join(root, "public", source)) : source;
    writeLabFile(name, content);
  }
}

function run(code, files, inputs = []) {
  writeLabFiles(files);
  out = [];
  const ns = py.toPy({});
  const err = py.globals.get("_nl_run")(code, ns, py.toPy(inputs));
  py.globals.get("_nl_figures")(ns);
  ns.set("_stdout", out.join("\n"));
  ns.set("_source", code);
  const error = err ? err.toJs({ dict_converter: Object.fromEntries }) : null;
  return { ns, error, stdout: out.join("\n") };
}

function check(exprs, ns) {
  return py.globals.get("_nl_check")(py.toPy(exprs), ns).toJs();
}

// Same as traceRows() in src/lib/traceRows.ts: each column's value every time `line` has just run.
function traceRows(trace, line, columns) {
  const rows = [];
  const steps = trace.steps;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s.event !== "line" || s.line !== line) continue;
    let j = i + 1;
    while (j < steps.length && steps[j].frames.length > s.frames.length) j++;
    const after = steps[j];
    if (!after) break;
    rows.push(
      columns.map((name) => {
        for (let f = after.frames.length - 1; f >= 0; f--) {
          const hit = after.frames[f].vars.find(([n]) => n === name);
          if (hit) return "v" in hit[1] ? hit[1].v : "(object)";
        }
        return null;
      }),
    );
  }
  return rows;
}

let bad = 0;
const report = (ok, tag, detail = "") => {
  if (!ok) bad++;
  console.log(`${ok ? "OK " : "BAD"} ${tag}${ok ? "" : "  " + detail}`);
};

for (const lab of labs) {
  if (only && lab.slug !== only) continue;
  await prepare(lab.packages);
  for (const s of lab.steps) {
    const tag = `${lab.slug}/${s.id}`;
    if (s.kind === "predict") {
      const r = run(s.code, lab.files);
      const got = r.error ? r.error.summary : r.stdout;
      const want = s.options[s.answer];
      report(got === want, tag, `got ${JSON.stringify(got)} want ${JSON.stringify(want)}`);
    } else if (s.kind === "concept" && s.code && (s.run ?? lab.runExamples)) {
      // Runnable lesson samples run cleanly, or fail with exactly the error they're there to show.
      const r = run(s.code, lab.files);
      const ok = s.runError ? r.error?.type === s.runError : !r.error;
      report(ok, tag, `sample ${s.runError ? `should raise ${s.runError}` : "should run"}: ${r.error?.summary ?? "no error"}`);
    } else if (s.kind === "code") {
      const exprs = s.checks.map((c) => c.expr);
      const st = run(s.starterCode, lab.files, s.inputs);
      const r0 = st.error ? exprs.map(() => false) : check(exprs, st.ns);
      if (!s.solution) {
        report(false, tag, "no solution");
        continue;
      }
      const so = run(s.solution, lab.files, s.inputs);
      const r1 = so.error ? exprs.map(() => false) : check(exprs, so.ns);
      const ok = r1.every(Boolean) && !r0.every(Boolean);
      report(ok, tag, `starter=${JSON.stringify(r0)} solution=${JSON.stringify(r1)} solutionError=${so.error?.summary ?? "none"}`);
    } else if (s.kind === "experiment" && s.widget === "visualiser") {
      writeLabFiles(lab.files);
      const t = JSON.parse(py.globals.get("_nl_trace")(s.visualise?.code ?? "", 500, py.toPy(s.visualise?.inputs ?? [])));
      const ok = !!s.visualise?.code && t.steps.length > 1 && !t.error && !t.truncated;
      report(ok, tag, `steps=${t.steps.length} error=${t.error?.summary ?? "none"} truncated=${t.truncated}`);
    } else if (s.kind === "experiment" && s.widget === "playground") {
      // The setup runs; each goal is met by its own answer/solution/example on fresh data,
      // and no check goal is already met before the learner does anything.
      const pg = s.playground ?? { setup: "", goals: [] };
      writeLabFiles(lab.files);
      const reset = () => JSON.parse(py.globals.get("_nl_play_reset")("validate", pg.setup, JSON.stringify(pg.goals)));
      const evalIn = (src) => JSON.parse(py.globals.get("_nl_play_eval")("validate", src));
      const problems = [];
      const start = reset();
      if (start.error) problems.push(`setup: ${start.error}`);
      if (evalIn("None").met.length) problems.push("a goal is met before the learner does anything");
      pg.goals.forEach((g, i) => {
        const entry = g.answer ?? g.solution ?? g.example;
        if (!entry) return problems.push(`goal ${i + 1} has no answer, solution or example`);
        reset();
        const r = evalIn(entry);
        if (!r.met.includes(i)) problems.push(`goal ${i + 1} not met by ${JSON.stringify(entry)} (${r.error ?? "no error"})`);
      });
      report(problems.length === 0 && pg.goals.length > 0, tag, problems.join("; "));
    } else if (s.kind === "parsons") {
      // The reference order passes every check; an empty program doesn't.
      const exprs = s.checks.map((c) => c.expr);
      const so = run(s.lines.join("\n"), lab.files);
      const r1 = so.error ? exprs.map(() => false) : check(exprs, so.ns);
      const empty = run("", lab.files);
      const r0 = check(exprs, empty.ns);
      const clash = (s.distractors ?? []).some((d) => s.lines.some((l) => l.trim() === d.trim()));
      report(r1.every(Boolean) && !r0.every(Boolean) && !clash, tag, `solution=${JSON.stringify(r1)} empty=${JSON.stringify(r0)} error=${so.error?.summary ?? "none"}${clash ? " distractor duplicates a line" : ""}`);
    } else if (s.kind === "trace") {
      // At least two rows, every cell a plain value (no objects), no error in the code.
      const t = JSON.parse(py.globals.get("_nl_trace")(s.code, 500, py.toPy([])));
      const rows = traceRows(t, s.line, s.columns);
      const plain = rows.every((row) => row.every((v) => v !== "(object)"));
      report(!t.error && rows.length >= 2 && plain, tag, `rows=${JSON.stringify(rows)} error=${t.error?.summary ?? "none"}`);
    } else if (s.kind === "bug") {
      const lines = s.code.replace(/\n$/, "").split("\n");
      const r = run(s.code, lab.files);
      const syntaxOk = r.error?.type !== "SyntaxError" && r.error?.type !== "IndentationError";
      report(s.line >= 1 && s.line <= lines.length && lines[s.line - 1].trim() !== "" && syntaxOk, tag, `line=${s.line} of ${lines.length}; ${r.error?.summary ?? "runs"}`);
    } else if (s.kind === "scenario") {
      const best = s.options.filter((o) => o.best).length;
      const silent = s.options.filter((o) => !o.feedback?.trim()).length;
      report(best === 1 && silent === 0 && s.options.length >= 3 && !!s.debrief?.trim(), tag, `best=${best} options=${s.options.length} withoutFeedback=${silent}`);
    } else if (s.kind === "explain") {
      const covered = s.ideas.map((i) => i.patterns.some((p) => new RegExp(p, "i").test(s.modelAnswer)));
      report(covered.every(Boolean), tag, `model answer misses ${JSON.stringify(s.ideas.filter((_, i) => !covered[i]).map((i) => i.label))}`);
    }
  }
}

console.log(`\n${bad} failure${bad === 1 ? "" : "s"}`);
process.exit(bad ? 1 : 0);
