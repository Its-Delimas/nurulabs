import type { Lab, Module, Track } from "./types";
import type { Progress } from "@/lib/progress";
import { tracks } from "./tracks";
import { allLabs } from "./labs";

export { tracks };
export type * from "./types";

const labsBySlug = new Map(allLabs.map((l) => [l.slug, l]));

export function getLab(slug: string): Lab | undefined {
  return labsBySlug.get(slug);
}

export function getTrack(slug: string): Track | undefined {
  return tracks.find((t) => t.slug === slug);
}

export function moduleLabs(mod: Module): Lab[] {
  return mod.labs.map((s) => labsBySlug.get(s)).filter((l): l is Lab => !!l);
}

/** All built labs of a track, in path order. */
export function trackLabs(track: Track): Lab[] {
  return track.modules.flatMap(moduleLabs);
}

export function trackOfLab(slug: string): Track | undefined {
  return tracks.find((t) => t.modules.some((m) => m.labs.includes(slug)));
}

export function moduleOfLab(slug: string): { module: Module; index: number } | undefined {
  const track = trackOfLab(slug);
  if (!track) return undefined;
  const index = track.modules.findIndex((m) => m.labs.includes(slug));
  return { module: track.modules[index], index };
}

export function isLabDone(progress: Progress | null, slug: string) {
  return !!progress?.labs[slug]?.completedAt;
}

export function isModuleDone(mod: Module, progress: Progress | null) {
  const labs = moduleLabs(mod);
  return labs.length > 0 && labs.every((l) => isLabDone(progress, l.slug));
}

export function trackStats(track: Track, progress: Progress | null) {
  const labs = trackLabs(track);
  const done = labs.filter((l) => isLabDone(progress, l.slug)).length;
  return {
    total: labs.length,
    done,
    percent: labs.length ? Math.round((done / labs.length) * 100) : 0,
    complete: labs.length > 0 && done === labs.length,
    next: labs.find((l) => !isLabDone(progress, l.slug)),
  };
}

export function passedPlacement(track: Track, progress: Progress | null) {
  return !!progress?.placements?.[track.slug];
}

/** Required tracks the learner has neither finished nor placed out of. */
export function missingPrerequisites(track: Track, progress: Progress | null): Track[] {
  return (track.requires ?? [])
    .map(getTrack)
    .filter(
      (t): t is Track =>
        !!t && !trackStats(t, progress).complete && !passedPlacement(t, progress),
    );
}

export function enrolledTrack(progress: Progress | null): Track | undefined {
  return progress?.enrolled ? getTrack(progress.enrolled.track) : undefined;
}

/**
 * One track at a time: a learner can enroll when the track is live, its
 * prerequisites are met, and they aren't midway through another track.
 */
export function enrollment(track: Track, progress: Progress | null):
  | { can: true }
  | { can: false; reason: "enrolled" | "coming-soon" }
  | { can: false; reason: "busy"; current: Track }
  | { can: false; reason: "prerequisite"; missing: Track[] } {
  const current = enrolledTrack(progress);
  if (current?.slug === track.slug) return { can: false, reason: "enrolled" };
  if (track.status !== "active") return { can: false, reason: "coming-soon" };
  const missing = missingPrerequisites(track, progress);
  if (missing.length) return { can: false, reason: "prerequisite", missing };
  // Placing out of the current track counts as finishing it.
  if (current && !trackStats(current, progress).complete && !passedPlacement(current, progress)) {
    return { can: false, reason: "busy", current };
  }
  return { can: true };
}

/** A track's labs are workable while enrolled in it, and open for review once finished or placed out of. */
export function canWorkOnTrack(track: Track, progress: Progress | null) {
  return (
    (!!progress?.preview && track.status === "active") ||
    enrolledTrack(progress)?.slug === track.slug ||
    trackStats(track, progress).complete ||
    passedPlacement(track, progress)
  );
}

export type LabAccess =
  | { open: true }
  | { open: false; reason: "not-enrolled"; track: Track }
  | { open: false; reason: "order"; first: Lab };

/** A lab is open when its track is workable and every lab before it is done. */
export function labAccess(slug: string, progress: Progress | null): LabAccess {
  const track = trackOfLab(slug);
  if (!track) return { open: true };
  if (!canWorkOnTrack(track, progress)) return { open: false, reason: "not-enrolled", track };
  if (progress?.preview) return { open: true };
  const labs = trackLabs(track);
  const idx = labs.findIndex((l) => l.slug === slug);
  const firstUndone = labs.slice(0, idx).find((l) => !isLabDone(progress, l.slug));
  return firstUndone ? { open: false, reason: "order", first: firstUndone } : { open: true };
}

/** The lab after this one on its track's path, if any. */
export function nextLabAfter(slug: string): Lab | undefined {
  const track = trackOfLab(slug);
  if (!track) return undefined;
  const labs = trackLabs(track);
  const idx = labs.findIndex((l) => l.slug === slug);
  return labs[idx + 1];
}

/** Tracks that list this one as a prerequisite. */
export function tracksUnlockedBy(track: Track): Track[] {
  return tracks.filter((t) => t.requires?.includes(track.slug));
}
