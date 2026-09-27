"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { trackLabs, tracks } from "@/lib/curriculum";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

// Only count what learners can take today, and shared labs once.
const openLabs = [...new Map(tracks.filter((t) => t.status === "active").flatMap(trackLabs).map((l) => [l.slug, l])).values()];
const liveLabs = openLabs.length;
const activities = openLabs.reduce((n, l) => n + l.steps.length, 0);

const stats = [
  { value: "Free", label: "Every track, every lab. No fees." },
  { value: String(liveLabs), label: "Hands-on labs live today" },
  { value: `${activities}+`, label: "Lessons, interactives and exercises" },
  { value: "0", label: "Installs — Python runs in your browser" },
];

export default function Hero() {
  return (
    <section className="overflow-hidden bg-cream pt-[68px] text-ink md:pt-0">
      <div className="grid md:min-h-[88vh] md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Words on a plain surface, so nothing competes with them. */}
        <div className="order-2 flex items-center px-6 pt-12 pb-16 md:order-1 md:pt-32 md:pr-12 md:pl-10 xl:pl-16">
          <div className="max-w-xl">
            <motion.p custom={0} initial="hidden" animate="show" variants={fadeUp} className="eyebrow text-lime-deep">
              Free · Africa&apos;s hands-on AI academy
            </motion.p>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight lg:text-7xl"
            >
              Learn AI by{" "}
              <span className="relative whitespace-nowrap">
                building it
                <svg viewBox="0 0 300 12" className="absolute -bottom-1 left-0 h-3 w-full text-lime" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 9C60 3 240 3 298 9" stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none" />
                </svg>
              </span>
              .
            </motion.h1>

            <motion.p custom={2} initial="hidden" animate="show" variants={fadeUp} className="mt-7 text-lg leading-relaxed text-ink/65">
              A free, structured programme that starts at your first line of Python and ends with models you
              trained yourself. Every lesson is followed by something you <em>do</em> — with a mentor that reads
              your errors with you.
            </motion.p>

            <motion.div custom={3} initial="hidden" animate="show" variants={fadeUp} className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/tracks" className="inline-flex items-center gap-2 rounded-md bg-lime px-7 py-4 text-sm font-semibold text-onlime">
                Start learning — it&apos;s free
                <ArrowRight size={16} />
              </Link>
              <a href="#try" className="rounded-md border border-ink/20 px-7 py-4 text-sm font-semibold text-ink hover:border-ink/50">
                Try an interactive
              </a>
            </motion.div>
          </div>
        </div>

        {/* Full-bleed photo: calm and clear, so the headline carries the page. */}
        <div className="relative order-1 min-h-[300px] md:order-2 md:min-h-0">
          <Image
            src="/images/coding-by-window.jpg"
            alt="A woman working on a laptop beside a window overlooking a city street"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-[60%_center]"
          />
        </div>
      </div>

      <div className="border-t border-ink/10 bg-paper">
        <dl className="grid grid-cols-2 gap-px px-6 md:px-10 xl:px-16 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="py-7 md:py-8"
            >
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className={`font-display text-3xl font-semibold ${i === 0 ? "text-lime-deep" : "text-ink"}`}>{s.value}</span>
                <span className="mt-1 block text-xs text-ink/55">{s.label}</span>
              </dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}
