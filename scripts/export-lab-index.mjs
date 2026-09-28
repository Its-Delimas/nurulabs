// Writes src/lib/curriculum/lab-index.json: every lab's metadata and step
// outline, without lesson text, code or checks. Client components use this
// index; only a lab's own page loads the lab's full content.
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
execSync(
  "npx tsc src/lib/curriculum/labs/index.ts --outDir .labs-build --module commonjs --target es2020 --skipLibCheck",
  { cwd: root, stdio: "inherit" },
);
const { allLabs } = createRequire(import.meta.url)(path.join(root, ".labs-build/labs/index.js"));
const index = allLabs.map((lab) => ({
  ...lab,
  steps: lab.steps.map((s) => ({ id: s.id, kind: s.kind, title: s.title, ...(s.challenge ? { challenge: true } : {}) })),
}));
writeFileSync(path.join(root, "src/lib/curriculum/lab-index.json"), JSON.stringify(index));
console.log(`Indexed ${index.length} labs (${Math.round(JSON.stringify(index).length / 1024)} KB)`);
