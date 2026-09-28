// Validates every lab in the same Pyodide runtime and harness the browser
// uses (public/nl_harness.py):
//   - code steps: the starter must NOT pass all checks; the solution must pass all
//   - predict steps: the marked answer must match what the code really prints
//   - explain steps: the model answer must cover every key idea
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
const prepared = new Set();

// Same self-hosted wheels as public/pyodide-worker.js.
const WHEELS = {
  openpyxl: ["et_xmlfile-2.0.0-py3-none-any.whl", "openpyxl-3.1.5-py2.py3-none-any.whl"],
};

async function prepare(packages = []) {
  const missing = packages.filter((p) => !prepared.has(p));
  if (!missing.length) return;
  const sources = missing.flatMap((p) => (WHEELS[p] ? WHEELS[p].map((w) => path.join(root, "public/wheels", w)) : [p]));
  await py.loadPackage(sources, { messageCallback: () => {} });
  py.globals.get("_nl_prepare")(py.toPy(missing));
  missing.forEach((p) => prepared.add(p));
}

function run(code, files) {
  for (const [name, source] of Object.entries(files ?? {})) {
    // Datasets are published under /data/ (see scripts/export-data.mjs).
    const content = /^\/(data|datasets)\//.test(source) ? readFileSync(path.join(root, "public", source)) : source;
    py.FS.writeFile(name, content);
  }
  out = [];
  const ns = py.toPy({});
  const err = py.globals.get("_nl_run")(code, ns);
  py.globals.get("_nl_figures")(ns);
  ns.set("_stdout", out.join("\n"));
  ns.set("_source", code);
  const error = err ? err.toJs({ dict_converter: Object.fromEntries }) : null;
  return { ns, error, stdout: out.join("\n") };
}

function check(exprs, ns) {
  return py.globals.get("_nl_check")(py.toPy(exprs), ns).toJs();
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
    } else if (s.kind === "code") {
      const exprs = s.checks.map((c) => c.expr);
      const st = run(s.starterCode, lab.files);
      const r0 = st.error ? exprs.map(() => false) : check(exprs, st.ns);
      if (!s.solution) {
        report(false, tag, "no solution");
        continue;
      }
      const so = run(s.solution, lab.files);
      const r1 = so.error ? exprs.map(() => false) : check(exprs, so.ns);
      const ok = r1.every(Boolean) && !r0.every(Boolean);
      report(ok, tag, `starter=${JSON.stringify(r0)} solution=${JSON.stringify(r1)} solutionError=${so.error?.summary ?? "none"}`);
    } else if (s.kind === "explain") {
      const covered = s.ideas.map((i) => i.patterns.some((p) => new RegExp(p, "i").test(s.modelAnswer)));
      report(covered.every(Boolean), tag, `model answer misses ${JSON.stringify(s.ideas.filter((_, i) => !covered[i]).map((i) => i.label))}`);
    }
  }
}

console.log(`\n${bad} failure${bad === 1 ? "" : "s"}`);
process.exit(bad ? 1 : 0);
