import type { TraceResult } from "@/hooks/usePyodideWorker";

/**
 * The rows of a trace table: the value of each column's variable every time
 * `line` has just run. Values are Python reprs ("120", "'maize'", "True");
 * a variable not set yet is null, and a list or object is "(object)".
 *
 * Keep in sync with traceRows() in scripts/validate-labs.mjs.
 */
export function traceRows(trace: TraceResult, line: number, columns: string[]): (string | null)[][] {
  const rows: (string | null)[][] = [];
  const steps = trace.steps;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s.event !== "line" || s.line !== line) continue;
    // The state once the line has finished: the next step back at the same call depth.
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

/** Whether a learner's answer matches a Python repr, forgiving quotes, case of True/False/None, and 2 vs 2.0. */
export function sameValue(answer: string, expected: string | null): boolean {
  const a = answer.trim();
  if (expected === null) return a === "" || a === "-";
  if (a === expected) return true;
  if (a === "") return false;
  const na = Number(a);
  const ne = Number(expected);
  if (!Number.isNaN(na) && !Number.isNaN(ne)) return Math.abs(na - ne) < 1e-9;
  if (/^(['"]).*\1$/.test(expected)) {
    const inner = expected.slice(1, -1);
    return a === inner || (/^(['"]).*\1$/.test(a) && a.slice(1, -1) === inner);
  }
  if (["True", "False", "None"].includes(expected)) return a.toLowerCase() === expected.toLowerCase();
  return false;
}
