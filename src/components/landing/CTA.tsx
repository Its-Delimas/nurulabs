"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden bg-code text-white">
      <Image src="/images/graduation-nairobi.webp" alt="Graduates in gowns celebrating together in Nairobi" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-black/65" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className="flex w-full flex-col items-center px-4 py-28 text-center sm:px-6 md:px-10 md:py-40 xl:px-16"
      >
        <p className="eyebrow text-lime">Free · No card · No installs</p>
        <h2 id="cta-title" className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-tight text-balance md:text-6xl">
          Your first program is five minutes away.
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg text-white/80">
          Enroll in Python Essentials, open Lab 01, and run real code before you&apos;ve finished your tea.
        </p>
        <Link href="/tracks/python-essentials" className={button({ variant: "accent", size: "lg", className: "mt-10" })}>
          Start learning
          <ArrowRight size={17} />
        </Link>
      </motion.div>
    </section>
  );
}
