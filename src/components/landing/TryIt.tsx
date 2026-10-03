"use client";

import { motion } from "framer-motion";
import LineFit from "@/components/lab/widgets/LineFit";
import SectionHeading from "@/components/ui/SectionHeading";

/** A real interactive from AI & ML Lab 01, running on the landing page. */
export default function TryIt() {
  return (
    <section id="try" aria-labelledby="try-title" className="scroll-mt-20 border-t border-ink/10 bg-cream px-4 py-20 sm:px-6 md:px-10 md:py-28 xl:px-16">
      <SectionHeading
        id="try-title"
        size="lg"
        eyebrow="Try it right here"
        title="Train a model with your hands."
        lede={
          <>
            Each dot is a maize farm: rainfall along the bottom, harvest up the side. Move the sliders until the line fits and
            watch the error shrink. That search for the best two numbers is exactly what &ldquo;training&rdquo; means. This is a
            real interactive from the AI &amp; ML track.
          </>
        }
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
        className="mt-10 md:mt-12"
      >
        <LineFit />
      </motion.div>
    </section>
  );
}
