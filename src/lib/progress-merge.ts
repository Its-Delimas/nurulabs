/**
 * Merging two copies of a learner's progress, e.g. this browser's and the one
 * saved on the server. Progress only grows, so the merge is a union: nothing
 * finished on either side is lost. The exception is "reset lab", recorded as
 * a timestamp in `resets`: a lab reset on one device stays reset unless it
 * was worked on again after the reset.
 *
 * Pure functions, no browser APIs, so they can be tested anywhere.
 */
import type { LabProgress, Progress } from "./progress";

export interface ProgressDoc {
  progress: Progress;
  /** Days with activity (YYYY-MM-DD), for streaks. */
  activity: string[];
}

const later = (a?: string, b?: string) => (!a ? b : !b ? a : a > b ? a : b);
const earlier = (a?: string, b?: string) => (!a ? b : !b ? a : a < b ? a : b);

function mergeLab(a: LabProgress | undefined, b: LabProgress | undefined): LabProgress {
  if (!a) return b!;
  if (!b) return a;
  // For saved code, prefer the side edited most recently, then fill any gaps.
  const [newer, older] = (a.updatedAt ?? "") >= (b.updatedAt ?? "") ? [a, b] : [b, a];
  const lab: LabProgress = { steps: [...new Set([...a.steps, ...b.steps])] };
  const completedAt = earlier(a.completedAt, b.completedAt);
  if (completedAt) lab.completedAt = completedAt;
  if (a.code || b.code) lab.code = { ...older.code, ...newer.code };
  const updatedAt = later(a.updatedAt, b.updatedAt);
  if (updatedAt) lab.updatedAt = updatedAt;
  return lab;
}

export function mergeProgress(a: Progress, b: Progress): Progress {
  const out: Progress = { labs: {} };
  for (const slug of new Set([...Object.keys(a.labs ?? {}), ...Object.keys(b.labs ?? {})])) {
    out.labs[slug] = mergeLab(a.labs?.[slug], b.labs?.[slug]);
  }

  const resets: Record<string, string> = {};
  for (const [slug, at] of [...Object.entries(a.resets ?? {}), ...Object.entries(b.resets ?? {})]) {
    resets[slug] = later(resets[slug], at)!;
  }
  for (const [slug, at] of Object.entries(resets)) {
    const lab = out.labs[slug];
    if (lab && (lab.updatedAt ?? "") <= at) delete out.labs[slug];
  }
  if (Object.keys(resets).length) out.resets = resets;

  const enrolled = !a.enrolled ? b.enrolled : !b.enrolled ? a.enrolled : a.enrolled.at >= b.enrolled.at ? a.enrolled : b.enrolled;
  if (enrolled) out.enrolled = enrolled;

  const placements: Record<string, string> = {};
  for (const [slug, at] of [...Object.entries(a.placements ?? {}), ...Object.entries(b.placements ?? {})]) {
    placements[slug] = earlier(placements[slug], at)!;
  }
  if (Object.keys(placements).length) out.placements = placements;

  if (a.preview || b.preview) out.preview = true;
  return out;
}

export function mergeDocs(a: ProgressDoc | null | undefined, b: ProgressDoc): ProgressDoc {
  if (!a) return b;
  return {
    progress: mergeProgress(a.progress ?? { labs: {} }, b.progress),
    activity: [...new Set([...(a.activity ?? []), ...b.activity])].sort(),
  };
}

/** JSON with object keys sorted, so equal documents compare equal (Postgres jsonb reorders keys). */
export function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(([, v]) => v !== undefined);
    return `{${entries.sort(([x], [y]) => (x < y ? -1 : 1)).map(([k, v]) => `${JSON.stringify(k)}:${stableJson(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}
