// Tests for src/lib/progress-merge.ts: how two copies of a learner's progress
// (this browser and their account) are combined. Run with `npm test`.
const { mergeProgress, mergeDocs, stableJson } = require("../.labs-build/merge/progress-merge.js");
const assert = require("node:assert/strict");
let n = 0; const t = (name, fn) => { fn(); n++; console.log("ok", name); };

t("union of steps, earliest completion, newest code wins", () => {
  const a = { labs: { x: { steps: ["s1", "s2"], completedAt: "2024-07-02", code: { c1: "old", c2: "a-only" }, updatedAt: "2024-07-02" } } };
  const b = { labs: { x: { steps: ["s2", "s3"], completedAt: "2024-07-01", code: { c1: "new" }, updatedAt: "2024-07-05" } } };
  const m = mergeProgress(a, b);
  assert.deepEqual(m.labs.x.steps, ["s1", "s2", "s3"]);
  assert.equal(m.labs.x.completedAt, "2024-07-01");
  assert.deepEqual(m.labs.x.code, { c1: "new", c2: "a-only" });
  assert.equal(m.labs.x.updatedAt, "2024-07-05");
});
t("labs only on one side are kept", () => {
  const m = mergeProgress({ labs: { a: { steps: ["1"] } } }, { labs: { b: { steps: ["2"] } } });
  assert.deepEqual(Object.keys(m.labs).sort(), ["a", "b"]);
});
t("a reset beats older progress from the other device", () => {
  const phone = { labs: {}, resets: { x: "2024-07-10" } };
  const server = { labs: { x: { steps: ["s1"], updatedAt: "2024-07-09" } } };
  assert.equal(mergeProgress(phone, server).labs.x, undefined);
  assert.equal(mergeProgress(server, phone).labs.x, undefined);
});
t("work after a reset survives it", () => {
  const phone = { labs: { x: { steps: ["s1"], updatedAt: "2024-07-11" } }, resets: { x: "2024-07-10" } };
  const server = { labs: { x: { steps: ["s1", "s2", "s3"], updatedAt: "2024-07-09" } } };
  const m = mergeProgress(phone, server);
  assert.ok(m.labs.x, "kept");
});
t("latest enrolment wins, placements keep the first pass, preview is sticky", () => {
  const a = { labs: {}, enrolled: { track: "data-science", at: "2024-07-01" }, placements: { p: "2024-06-01" }, preview: true };
  const b = { labs: {}, enrolled: { track: "ai-ml", at: "2024-08-01" }, placements: { p: "2024-05-01", q: "2024-09-01" } };
  const m = mergeProgress(a, b);
  assert.equal(m.enrolled.track, "ai-ml");
  assert.deepEqual(m.placements, { p: "2024-05-01", q: "2024-09-01" });
  assert.equal(m.preview, true);
});
t("merge is idempotent and order-independent (as JSON)", () => {
  const a = { progress: { labs: { x: { steps: ["1"], updatedAt: "1" } }, enrolled: { track: "t", at: "1" } }, activity: ["2024-07-02", "2024-07-01"] };
  const b = { progress: { labs: { y: { steps: ["2"] } }, resets: { z: "5" } }, activity: ["2024-07-03"] };
  const ab = mergeDocs(a, b), ba = mergeDocs(b, a);
  assert.equal(stableJson(ab), stableJson(ba));
  assert.equal(stableJson(mergeDocs(ab, ab)), stableJson(ab));
  assert.deepEqual(ab.activity, ["2024-07-01", "2024-07-02", "2024-07-03"]);
});
t("no server copy yet: local is used as is", () => {
  const local = { progress: { labs: {} }, activity: [] };
  assert.equal(mergeDocs(null, local), local);
});
t("stableJson ignores key order", () => {
  assert.equal(stableJson({ b: 1, a: { d: 2, c: [3, { f: 1, e: 2 }] } }), stableJson({ a: { c: [3, { e: 2, f: 1 }], d: 2 }, b: 1 }));
});
console.log(n, "tests passed");
