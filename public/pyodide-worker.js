import { loadPyodide } from "/pyodide/pyodide.mjs";

// The core interpreter is self-hosted; optional packages (NumPy, pandas,
// matplotlib…) are fetched on demand from the matching CDN build and
// cached by the browser.
const PACKAGE_BASE_URL = "https://cdn.jsdelivr.net/pyodide/v314.0.7/full/";

let pyodideReadyPromise = null;
let stdoutLines = [];
const loadedPackages = new Set();

async function initPyodide() {
  const pyodide = await loadPyodide({
    indexURL: "/pyodide/",
    packageBaseUrl: PACKAGE_BASE_URL,
    stdout: (msg) => {
      stdoutLines.push(msg);
      postMessage({ type: "stdout", data: msg });
    },
    stderr: (msg) => postMessage({ type: "stderr", data: msg }),
  });
  // One harness shared with the content validator: see public/nl_harness.py
  // (running and checking code), public/nl_trace.py (the step-through tracer)
  // and public/nl_play.py (playground sessions).
  for (const file of ["/nl_harness.py", "/nl_trace.py", "/nl_play.py"]) {
    pyodide.runPython(await (await fetch(file)).text());
  }
  return pyodide;
}

function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = initPyodide();
  }
  return pyodideReadyPromise;
}

let lastNamespace = null;

// Lab datasets are published under /data/ (generated CSVs) or /datasets/
// (committed binary files) and downloaded on first use;
// anything else in a lab's files is the file's content itself.
const fileCache = new Map();

async function fileContent(source) {
  if (!/^\/(data|datasets|notebooks)\//.test(source)) return source;
  if (!fileCache.has(source)) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`Couldn't download the dataset ${source} (HTTP ${res.status}).`);
    // Text for CSV/JSON; raw bytes for binary files such as Excel workbooks.
    const binary = /\.(xlsx|xls|zip|parquet)$/i.test(source);
    fileCache.set(source, binary ? new Uint8Array(await res.arrayBuffer()) : await res.text());
  }
  return fileCache.get(source);
}

async function writeFiles(pyodide, files) {
  if (!files) return;
  for (const [name, source] of Object.entries(files)) {
    pyodide.FS.writeFile(name, await fileContent(source));
  }
}

// Pure-Python packages Pyodide doesn't ship, self-hosted as wheels in /wheels/
// (dependencies first). Keep in sync with scripts/validate-labs.mjs.
const WHEELS = {
  openpyxl: ["/wheels/et_xmlfile-2.0.0-py3-none-any.whl", "/wheels/openpyxl-3.1.5-py2.py3-none-any.whl"],
};

async function ensurePackages(pyodide, packages) {
  const missing = (packages || []).filter((p) => !loadedPackages.has(p));
  if (missing.length === 0) return;
  postMessage({ type: "packages-loading", data: missing.join(", ") });
  const sources = missing.flatMap((p) => (WHEELS[p] ? WHEELS[p].map((w) => new URL(w, self.location.origin).href) : [p]));
  // loadPackage reports failed downloads through errorCallback instead of
  // throwing; throw so the run shows a clear "check your connection" error
  // and the packages are retried next time.
  const failures = [];
  await pyodide.loadPackage(sources, { messageCallback: () => {}, errorCallback: (m) => failures.push(m) });
  if (failures.length) throw new Error(`Failed to fetch packages: ${failures.join(" ")}`);
  pyodide.globals.get("_nl_prepare")(pyodide.toPy(missing));
  missing.forEach((p) => loadedPackages.add(p));
  postMessage({ type: "packages-loaded" });
}

self.onmessage = async (event) => {
  const { type, code, runId, exprs, files, packages, maxSteps, inputs, sid, goals } = event.data;

  if (type === "play-reset" || type === "play-eval") {
    // Playground console: one persistent namespace per session (see public/nl_play.py).
    try {
      const pyodide = await getPyodide();
      if (type === "play-reset") {
        await ensurePackages(pyodide, packages);
        await writeFiles(pyodide, files);
      }
      postMessage({ type: "play-start", runId });
      const fn = pyodide.globals.get(type === "play-reset" ? "_nl_play_reset" : "_nl_play_eval");
      const data = type === "play-reset" ? fn(sid, code, JSON.stringify(goals || [])) : fn(sid, code);
      fn.destroy();
      postMessage({ type: "play-result", runId, data });
    } catch (err) {
      const error = String(err && err.message ? err.message : err);
      postMessage({ type: "play-result", runId, data: JSON.stringify({ error, met: [], vars: [], out: "" }) });
    }
    return;
  }

  if (type === "trace") {
    // Run code line by line for the visualiser (see public/nl_trace.py).
    try {
      const pyodide = await getPyodide();
      await ensurePackages(pyodide, packages);
      await writeFiles(pyodide, files);
      postMessage({ type: "trace-start", runId });
      const tracer = pyodide.globals.get("_nl_trace");
      const data = tracer(code, maxSteps || 500, pyodide.toPy(inputs || []));
      tracer.destroy();
      postMessage({ type: "trace-result", runId, data });
    } catch (err) {
      const summary = String(err && err.message ? err.message : err);
      postMessage({
        type: "trace-result",
        runId,
        data: JSON.stringify({ steps: [], error: { summary, line: null }, truncated: false, out: "" }),
      });
    }
    return;
  }

  if (type === "init") {
    try {
      await getPyodide();
      postMessage({ type: "ready" });
    } catch (err) {
      postMessage({ type: "init-error", error: String(err) });
    }
    return;
  }

  if (type === "preload") {
    // Start downloading the lab's datasets while its packages load.
    for (const source of Object.values(files || {})) fileContent(source).catch(() => {});
    try {
      await ensurePackages(await getPyodide(), packages);
    } catch {
      postMessage({ type: "packages-loaded" });
    }
    return;
  }

  if (type === "run") {
    try {
      const pyodide = await getPyodide();
      await ensurePackages(pyodide, packages);
      // Fresh files and globals per run: a re-run never sees state
      // left over from a previous or different run.
      await writeFiles(pyodide, files);
      const ns = pyodide.toPy({});
      stdoutLines = [];
      postMessage({ type: "run-start", runId });
      const runner = pyodide.globals.get("_nl_run");
      const result = runner(code, ns);
      runner.destroy();
      const figs = pyodide.globals.get("_nl_figures")(ns);
      const images = figs.toJs();
      figs.destroy();
      ns.set("_stdout", stdoutLines.join("\n"));
      ns.set("_source", code);
      lastNamespace = ns;
      if (result) {
        const error = result.toJs({ dict_converter: Object.fromEntries });
        result.destroy();
        postMessage({ type: "run-end", runId, ok: false, error, images });
      } else {
        postMessage({ type: "run-end", runId, ok: true, images });
      }
    } catch (err) {
      const text = String(err);
      const offline = /fetch|network|load package/i.test(text);
      postMessage({
        type: "run-end",
        runId,
        ok: false,
        images: [],
        error: {
          type: offline ? "PackageLoadError" : "InternalError",
          summary: offline
            ? "PackageLoadError: couldn't download the Python libraries this lab needs — check your internet connection and run again"
            : String(err && err.message ? err.message : err),
          traceback: "",
          line: null,
          vars: [],
        },
      });
    }
    return;
  }

  if (type === "check") {
    try {
      const pyodide = await getPyodide();
      if (!lastNamespace) {
        postMessage({ type: "check-result", runId, results: exprs.map(() => false) });
        return;
      }
      const checker = pyodide.globals.get("_nl_check");
      const proxy = checker(pyodide.toPy(exprs), lastNamespace);
      const results = proxy.toJs();
      proxy.destroy();
      checker.destroy();
      postMessage({ type: "check-result", runId, results });
    } catch {
      postMessage({ type: "check-result", runId, results: exprs.map(() => false) });
    }
  }
};
