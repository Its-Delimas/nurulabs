"use client";

import { MotionConfig } from "framer-motion";

/** Every framer-motion animation follows the learner's reduced-motion setting. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
