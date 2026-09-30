"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="relative isolate overflow-hidden bg-code text-white">
      <Image src="/images/nairobi-night.jpg" alt="Nairobi's city centre lit up at night" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-black/65" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="flex w-full flex-col items-center px-6 md:px-10 xl:px-16 py-32 text-center md:py-44"
      >
        <p className="eyebrow text-lime">Free · No card · No installs</p>
        <h2 className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
          Your first program is five minutes away.
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-white/70">
          Enroll in Python Essentials, open Lab 01, and run real code before you&apos;ve finished your tea.
        </p>
        <Link
          href="/tracks"
          className="mt-10 inline-flex items-center gap-2 rounded-md bg-lime px-8 py-4 text-sm font-semibold text-onlime"
        >
          Start learning free
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
}
