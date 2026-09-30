"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { startSync } from "@/lib/sync";

/** Syncs progress with the learner's account while they're signed in. Renders nothing. */
export default function ProgressSync() {
  const { user } = useAuth();
  const userId = user?.id;
  useEffect(() => (userId ? startSync(userId) : undefined), [userId]);
  return null;
}
