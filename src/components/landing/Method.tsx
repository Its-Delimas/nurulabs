"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import LabPreview from "./LabPreview";

const STEPS = [
  ["Learn", "a short idea, with a picture or a line of code you can run."],
  ["Play", "with an interactive until the idea clicks."],
  ["Build", "it in real Python, with instant checks and a mentor that reads your errors."],
  ["Explain", "it back in your own words, the real test of understanding."],
];

/** How a lab works: the four moves, beside a still of a real practice step. */
export default function Method() {
  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-20 border-t border-ink/10 bg-paper px-4 py-20 sm:px-6 md:px-10 md:py-28 xl:px-16">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <SectionHeading
            id="how-title"
            size="lg"
            eyebrow="How it works"
            title="Understand it, then build it."
            lede="No hour-long videos. Every idea is followed straight away by something you do, in real Python that runs in the page."
          />
          <ol className="mt-10 space-y-5">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime font-mono text-xs font-semibold text-onlime">{i + 1}</span>
                <p className="pt-1 leading-relaxed text-ink/70">
                  <strong className="font-semibold text-ink">{title}</strong> {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.45 }}>
          <LabPreview />
        </motion.div>
      </div>
    </section>
  );
}
