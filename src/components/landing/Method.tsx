"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const STEPS = [
  ["Learn", "a short idea, with a picture or a line of code."],
  ["Play", "with an interactive until the idea clicks."],
  ["Build", "it in real Python, with instant checks and a mentor that reads your errors."],
  ["Explain", "it back in your own words — the test of real understanding."],
];

/** How lessons work, beside a cluster of round photos. */
export default function Method() {
  return (
    <section id="how" className="relative scroll-mt-20 overflow-hidden bg-paper px-6 py-24 md:px-10 xl:px-16">
      <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative mx-auto aspect-square w-full max-w-[520px]">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full opacity-40" aria-hidden="true">
            {Array.from({ length: 13 }, (_, r) => Array.from({ length: 13 }, (_, c) => (r + c) % 2 === 0 && Math.hypot(r - 6, c - 6) < 6.5 && (
              <circle key={`${r}-${c}`} cx={4 + c * 7.6} cy={4 + r * 7.6} r={0.9} className="fill-ink/30" />
            )))}
          </svg>
          <div className="absolute top-[12%] left-[10%] h-[64%] w-[64%] overflow-hidden rounded-full ring-8 ring-paper">
            <Image src="/images/circle-pair.webp" alt="Two young developers working together at a computer" fill sizes="340px" className="object-cover object-[60%_center]" />
          </div>
          <div className="absolute top-[4%] right-[2%] h-[36%] w-[36%] overflow-hidden rounded-full ring-8 ring-paper">
            <Image src="/images/circle-class.webp" alt="Students in a coding class with laptops" fill sizes="200px" className="object-cover" />
          </div>
          <div className="absolute bottom-[4%] left-[2%] h-[26%] w-[26%] overflow-hidden rounded-full ring-8 ring-paper">
            <Image src="/images/hero-students.webp" alt="Students sitting outdoors with laptops" fill sizes="140px" className="object-cover object-[45%_center]" />
          </div>
          <span aria-hidden="true" className="absolute top-[40%] left-0 h-4 w-4 rounded-full bg-sun" />
          <span aria-hidden="true" className="absolute right-[12%] bottom-[20%] h-3 w-3 rounded-full bg-lime-deep" />
          <span aria-hidden="true" className="absolute top-[2%] left-[40%] h-3 w-3 rounded-full border-2 border-sky" />
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5 }} className="max-w-xl">
          <p className="eyebrow text-lime-deep">How it works</p>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">Understand it, then build it.</h2>
          <p className="mt-5 font-semibold text-ink/80">No hour-long videos. Every idea is followed straight away by something you do.</p>
          <ol className="mt-8 space-y-4">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime font-mono text-xs font-semibold text-onlime">{i + 1}</span>
                <p className="pt-1 text-ink/65"><strong className="font-semibold text-ink">{title}</strong> {body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link href="/tracks" className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-paper">
              Choose your track <ArrowRight size={15} />
            </Link>
            <a href="#try" className="inline-flex items-center gap-3 text-sm font-semibold text-ink">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-deep text-paper"><Play size={14} fill="currentColor" /></span>
              Try one now
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
