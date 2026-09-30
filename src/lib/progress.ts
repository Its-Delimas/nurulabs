"use client";

import { useSyncExternalStore } from "react";

/**
 * Learner progress, kept in localStorage (there are no accounts yet).
 *
 * Stored per lab: which steps are done, when the lab was finished, and the
 * learner's latest code per code step so they can pick up where they left off.
 */

export interface LabProgress {
  steps: string[];
  completedAt?: string;
  code?: Record<string, string>;
}

export interface Progress {
  labs: Record<string, LabProgress>;
  /** The one track the learner is working through right now. */
  enrolled?: { track: string; at: string };
  /** Tracks the learner tested out of with a placement check, by slug. */
  placements?: Record<string, string>;
  /** Reviewer preview: every lab of every live track is open, whatever the enrollment. */
  preview?: boolean;
}

const STORAGE_KEY = "nurulabs:progress:v2";
const LEGACY_KEY = "nurulabs:progress";
const ACTIVITY_KEY = "nurulabs:activity";
const CHANGE_EVENT = "nurulabs:progress-change";

const EMPTY: Progress = { labs: {} };

function readRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage unavailable (private mode, blocked) — progress just won't persist.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Tracks that have been renamed: old slug -> new slug.
const RENAMED_TRACKS: Record<string, string> = { "python-for-ai": "python-essentials" };

/** Point enrolment and placement records at renamed tracks' new slugs. */
function renameTracks(p: Progress): Progress {
  const enrolled = p.enrolled && RENAMED_TRACKS[p.enrolled.track] ? { ...p.enrolled, track: RENAMED_TRACKS[p.enrolled.track] } : p.enrolled;
  const placements = p.placements
    ? Object.fromEntries(Object.entries(p.placements).map(([slug, at]) => [RENAMED_TRACKS[slug] ?? slug, at]))
    : p.placements;
  return { ...p, enrolled, placements };
}

function parseProgress(raw: string | null): Progress {
  if (!raw) {
    // Carry over missions finished under the old, flat progress format.
    const legacy = readRaw(LEGACY_KEY);
    if (!legacy) return EMPTY;
    try {
      const slugs: unknown = JSON.parse(legacy);
      if (!Array.isArray(slugs)) return EMPTY;
      const labs: Record<string, LabProgress> = {};
      for (const slug of slugs) {
        if (typeof slug === "string") {
          labs[slug] = { steps: [], completedAt: new Date().toISOString() };
        }
      }
      return { labs };
    } catch {
      return EMPTY;
    }
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed.labs === "object" ? renameTracks(parsed) : EMPTY;
  } catch {
    return EMPTY;
  }
}

// useSyncExternalStore needs a stable snapshot, so cache by the raw string.
let cachedRaw: string | null | undefined;
let cachedProgress: Progress = EMPTY;

export function getProgress(): Progress {
  const raw = readRaw(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedProgress = parseProgress(raw);
  }
  return cachedProgress;
}

function update(fn: (p: Progress) => Progress) {
  write(STORAGE_KEY, fn(getProgress()));
}

function labOf(p: Progress, slug: string): LabProgress {
  return p.labs[slug] ?? { steps: [] };
}

/** Turn reviewer preview on or off (see /preview). Progress itself is untouched. */
export function setPreview(on: boolean) {
  update((p) => ({ ...p, preview: on || undefined }));
}

export function markStepComplete(labSlug: string, stepId: string) {
  update((p) => {
    const lab = labOf(p, labSlug);
    if (lab.steps.includes(stepId)) return p;
    return {
      ...p,
      labs: { ...p.labs, [labSlug]: { ...lab, steps: [...lab.steps, stepId] } },
    };
  });
}

export function markLabComplete(labSlug: string) {
  update((p) => {
    const lab = labOf(p, labSlug);
    if (lab.completedAt) return p;
    return {
      ...p,
      labs: {
        ...p.labs,
        [labSlug]: { ...lab, completedAt: new Date().toISOString() },
      },
    };
  });
}

export function saveCode(labSlug: string, stepId: string, code: string) {
  update((p) => {
    const lab = labOf(p, labSlug);
    return {
      ...p,
      labs: {
        ...p.labs,
        [labSlug]: { ...lab, code: { ...lab.code, [stepId]: code } },
      },
    };
  });
}

export function enroll(trackSlug: string) {
  update((p) => ({ ...p, enrolled: { track: trackSlug, at: new Date().toISOString() } }));
}

export function recordPlacement(trackSlug: string) {
  update((p) => ({
    ...p,
    placements: { ...p.placements, [trackSlug]: new Date().toISOString() },
  }));
}

export function resetLab(labSlug: string) {
  update((p) => {
    const labs = { ...p.labs };
    delete labs[labSlug];
    return { ...p, labs };
  });
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Live progress. `null` during SSR and the first client render. */
export function useProgress(): Progress | null {
  return useSyncExternalStore<Progress | null>(subscribe, getProgress, () => null);
}

// ─── Activity (streaks) ────────────────────────────────────────────────

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

let cachedActivityRaw: string | null | undefined;
let cachedActivity: Set<string> = new Set();

export function getActivityDates(): Set<string> {
  const raw = readRaw(ACTIVITY_KEY);
  if (raw !== cachedActivityRaw) {
    cachedActivityRaw = raw;
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      cachedActivity = new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      cachedActivity = new Set();
    }
  }
  return cachedActivity;
}

/** Records that the learner actually ran code today — a real activity signal. */
export function recordActivityToday(): void {
  const today = dateKey(new Date());
  const dates = getActivityDates();
  if (dates.has(today)) return;
  write(ACTIVITY_KEY, [...dates, today]);
}

const EMPTY_DATES = new Set<string>();

export function useActivityDates(): Set<string> {
  return useSyncExternalStore(subscribe, getActivityDates, () => EMPTY_DATES);
}
