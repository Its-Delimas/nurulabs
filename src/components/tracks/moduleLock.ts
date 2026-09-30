import type { Module } from "@/lib/curriculum/types";
import { labAccess, moduleLabs } from "@/lib/curriculum";
import type { Progress } from "@/lib/progress";

/**
 * A module is locked for an enrolled learner until one of its labs opens.
 * Visitors who aren't working on the track see the syllabus unlocked, to browse.
 */
export function isModuleLocked(mod: Module, progress: Progress | null, workable: boolean) {
  const labs = moduleLabs(mod);
  return workable && labs.length > 0 && !labs.some((l) => labAccess(l.slug, progress).open);
}
