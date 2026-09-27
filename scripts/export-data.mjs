// Writes every lab dataset from src/lib/curriculum/data/registry.ts to
// public/data/, so labs download them on demand rather than bundling them.
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
execSync(
  "npx tsc src/lib/curriculum/data/registry.ts --outDir .labs-build/data --module commonjs --target es2020 --skipLibCheck",
  { cwd: root, stdio: "inherit" },
);
const { DATA_FILES } = createRequire(import.meta.url)(path.join(root, ".labs-build/data/registry.js"));
const out = path.join(root, "public/data");
mkdirSync(out, { recursive: true });
for (const [name, csv] of Object.entries(DATA_FILES)) writeFileSync(path.join(out, name), csv);
console.log(`Exported ${Object.keys(DATA_FILES).length} datasets to public/data/`);
