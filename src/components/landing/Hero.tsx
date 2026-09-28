"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { AFRICA, AFRICA_DOTS, AFRICA_PATH } from "./africa";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

// Small decorative accents around the map, as on a printed poster.
const SPECKS = [
  { top: "8%", left: "18%", size: 14, color: "var(--color-sun)" },
  { top: "26%", left: "4%", size: 9, color: "var(--color-sky)" },
  { top: "14%", right: "6%", size: 11, color: "var(--color-danger)" },
  { top: "58%", left: "2%", size: 12, color: "var(--color-lime-deep)" },
  { bottom: "10%", left: "30%", size: 10, color: "var(--color-sky)" },
  { bottom: "18%", right: "4%", size: 15, color: "var(--color-sun)" },
];

/** Counts come from the server (app/page.tsx) so lab content never ships to the landing page. */
export default function Hero({ liveLabs, activities }: { liveLabs: number; activities: number }) {
  const stats = [
    { value: "Free", label: "Every track, every lab" },
    { value: String(liveLabs), label: "Hands-on labs" },
    { value: `${activities}+`, label: "Lessons & exercises" },
  ];

  return (
    <section className="relative overflow-hidden bg-cream pt-[76px] text-ink">
      {/* A faint dotted continent behind everything, like a map on the wall. */}
      <svg viewBox={`0 0 ${AFRICA.width} ${AFRICA.height}`} className="pointer-events-none absolute -top-24 -right-40 hidden h-[130%] opacity-[0.07] md:block" aria-hidden="true">
        {AFRICA_DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.2} className="fill-ink" />)}
      </svg>

      <div className="relative grid items-center gap-10 px-6 pt-10 pb-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:px-10 md:pt-16 md:pb-24 xl:px-16">
        <div className="max-w-xl">
          <motion.p custom={0} initial="hidden" animate="show" variants={fadeUp} className="eyebrow text-lime-deep">
            Free · Built for African learners
          </motion.p>
          <motion.h1 custom={1} initial="hidden" animate="show" variants={fadeUp} className="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight md:text-6xl xl:text-7xl">
            Africa&apos;s AI builders{" "}
            <span className="relative whitespace-nowrap">
              start here
              <svg viewBox="0 0 300 12" className="absolute -bottom-1 left-0 h-3 w-full text-lime" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 9C60 3 240 3 298 9" stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            .
          </motion.h1>
          <motion.p custom={2} initial="hidden" animate="show" variants={fadeUp} className="mt-7 text-lg leading-relaxed text-ink/65">
            A free, structured path from your first line of Python to models you trained yourself — on data about
            farms, clinics, markets and mobile money. Everything runs in your browser, so any laptop will do.
          </motion.p>
          <motion.div custom={3} initial="hidden" animate="show" variants={fadeUp} className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/tracks" className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-4 text-sm font-semibold text-paper">
              Start learning free
              <ArrowRight size={16} />
            </Link>
            <a href="#try" className="inline-flex items-center gap-3 text-sm font-semibold text-ink">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-deep text-paper">
                <Play size={16} fill="currentColor" />
              </span>
              Try an interactive
            </a>
          </motion.div>
          <motion.dl custom={4} initial="hidden" animate="show" variants={fadeUp} className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-3xl font-semibold text-ink">{s.value}</dd>
                <dd className="text-xs text-ink/50">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* Students, in the shape of the continent they're building for. */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative mx-auto w-full max-w-[640px]">
          <svg viewBox={`-20 -20 ${AFRICA.width + 40} ${AFRICA.height + 40}`} className="w-full" role="img" aria-label="Students with laptops, shown inside a map of Africa">
            <defs>
              <clipPath id="hero-africa">
                <path d={AFRICA_PATH} />
              </clipPath>
            </defs>
            <path d={AFRICA_PATH} transform="translate(16 18)" className="fill-mist" />
            <g clipPath="url(#hero-africa)">
              {/* A two-photo collage: students across the north, a coding class across the south. */}
              <image href="/images/hero-students.webp" x={-40} y={-10} width={780} height={470} preserveAspectRatio="xMidYMax slice" />
              <image href="/images/circle-class.webp" x={170} y={430} width={480} height={300} preserveAspectRatio="xMidYMid slice" />
              <line x1={0} y1={432} x2={AFRICA.width} y2={432} className="stroke-paper" strokeWidth={6} />
            </g>
            <path d={AFRICA_PATH} fill="none" className="stroke-paper" strokeWidth={4} />
          </svg>
          {SPECKS.map((s, i) => (
            <span key={i} aria-hidden="true" className="absolute rounded-full" style={{ ...s, width: s.size, height: s.size, background: s.color }} />
          ))}
          <div className="absolute bottom-[14%] left-0 hidden rounded-2xl bg-paper p-4 shadow-xl ring-1 ring-ink/10 sm:block">
            <code className="block font-mono text-xs text-ink">print(&quot;Habari, dunia!&quot;)</code>
            <p className="mt-2 flex items-center gap-2 text-xs text-ink/55"><span className="h-2 w-2 rounded-full bg-lime-deep" /> Python, running in your browser</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
