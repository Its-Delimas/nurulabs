"use client";

import { useSyncExternalStore } from "react";
import { getSupabase } from "./supabase/client";
import { CHANGE_EVENT, getActivityDates, getProgress, replaceActivity, replaceProgress } from "./progress";
import { mergeDocs, stableJson, type ProgressDoc } from "./progress-merge";

/**
 * Keeps a signed-in learner's progress in their account (table
 * `learner_progress`, one JSON document per learner; see
 * supabase/migrations). Every sync pulls the saved copy, merges it with this
 * browser's, stores the result locally, and pushes it back only if the server
 * copy was different. Merging (not overwriting) means two devices never undo
 * each other's work.
 */

export type SyncStatus = "idle" | "syncing" | "saved" | "error";

let status: SyncStatus = "idle";
const listeners = new Set<() => void>();
function setStatus(s: SyncStatus) {
  status = s;
  listeners.forEach((l) => l());
}

export function useSyncStatus(): SyncStatus {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => status,
    () => "idle",
  );
}

function localDoc(): ProgressDoc {
  return { progress: getProgress(), activity: [...getActivityDates()].sort() };
}

let running = false;
let again = false;

async function syncOnce(userId: string) {
  const supabase = getSupabase();
  if (!supabase) return;
  if (running) {
    again = true;
    return;
  }
  running = true;
  setStatus("syncing");
  try {
    const { data, error } = await supabase.from("learner_progress").select("data").eq("user_id", userId).maybeSingle();
    if (error) throw error;
    const saved = (data?.data ?? null) as ProgressDoc | null;
    const local = localDoc();
    const merged = mergeDocs(saved, local);

    if (stableJson(merged.progress) !== stableJson(local.progress)) replaceProgress(merged.progress);
    if (stableJson(merged.activity) !== stableJson(local.activity)) replaceActivity(merged.activity);
    if (stableJson(merged) !== stableJson(saved)) {
      const { error: upsertError } = await supabase
        .from("learner_progress")
        .upsert({ user_id: userId, data: merged, updated_at: new Date().toISOString() });
      if (upsertError) throw upsertError;
    }
    setStatus("saved");
  } catch {
    setStatus("error"); // offline or not set up yet; the next change or visit retries
  } finally {
    running = false;
    if (again) {
      again = false;
      void syncOnce(userId);
    }
  }
}

/** Start syncing for this learner. Returns a function that stops it. */
export function startSync(userId: string): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const soon = () => {
    clearTimeout(timer);
    timer = setTimeout(() => void syncOnce(userId), 2000);
  };
  const onVisible = () => {
    if (document.visibilityState === "visible") void syncOnce(userId);
  };
  const onOnline = () => void syncOnce(userId);

  void syncOnce(userId);
  window.addEventListener(CHANGE_EVENT, soon);
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("online", onOnline);
  return () => {
    clearTimeout(timer);
    window.removeEventListener(CHANGE_EVENT, soon);
    document.removeEventListener("visibilitychange", onVisible);
    window.removeEventListener("online", onOnline);
    setStatus("idle");
  };
}
