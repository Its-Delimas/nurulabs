"use client";

import { motion } from "framer-motion";

/** A thin progress bar. Give it a label: screen readers announce it with the value. */
export default function ProgressBar({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={v} aria-label={label} className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
      <motion.div
        className="h-full rounded-full bg-lime-deep"
        initial={{ width: 0 }}
        animate={{ width: `${v}%` }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
