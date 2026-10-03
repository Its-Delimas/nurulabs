"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AFRICA, AFRICA_PATH } from "./africa";
import { button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress";

const ease = [0.16, 1, 0.3, 1] as const;

/** Counts come from the server (app/page.tsx) so lab content never ships to the landing page. */
export default function Hero({ tracks, liveLabs, activities }: { tracks: number; liveLabs: number; activities: number }) {
  const progress = useProgress();
  const started = !!progress?.enrolled || Object.keys(progress?.labs ?? {}).length > 0;
  const stats = [
    { value: String(tracks), label: "learning tracks" },
    { value: String(liveLabs), label: "hands-on labs" },
    { value: `${(Math.floor(activities / 100) * 100).toLocaleString("en")}+`, label: "lessons and exercises" },
  ];

  return (
    <section aria-labelledby="hero-title" className="bg-cream pt-16 md:pt-[72px]">
      <div className="grid grid-cols-1 items-center gap-12 px-4 pt-10 pb-16 sm:px-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:px-10 md:pt-16 md:pb-24 xl:px-16">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }} className="max-w-xl">
          <p className="eyebrow text-lime-deep">Free · Built for African learners</p>
          <h1 id="hero-title" className="mt-5 font-display text-5xl font-semibold leading-[1.02] tracking-tight text-ink md:text-6xl xl:text-7xl">
            Africa&apos;s AI builders{" "}
            <span className="relative whitespace-nowrap">
              start here
              <svg viewBox="0 0 300 12" className="absolute -bottom-1 left-0 h-3 w-full text-lime" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 9C60 3 240 3 298 9" stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none" />
              </svg>
            </span>
            .
          </h1>
          <p className="mt-7 text-lg leading-relaxed text-ink/70">
            A structured path from your first line of Python to models you trained yourself, on data about farms, clinics,
            markets and mobile money. It all runs in your browser, so any laptop will do.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={started ? "/dashboard" : "/tracks/python-essentials"} className={button({ size: "lg" })}>
              {started ? "Continue learning" : "Start learning"}
              <ArrowRight size={17} />
            </Link>
            <a href="#try" className={button({ variant: "secondary", size: "lg" })}>
              Try it in your browser
            </a>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-ink/10 pt-6">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <dt className="order-2 text-sm leading-snug text-ink/60">{s.label}</dt>
                <dd className="order-1 font-display text-3xl font-semibold text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        {/* Students, in the shape of the continent they're building for. */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease }}
          className="relative mx-auto w-full max-w-[600px]"
        >
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
          <div className="absolute bottom-[12%] left-0 hidden rounded-xl bg-paper px-4 py-3 shadow-lg ring-1 ring-ink/10 sm:block" aria-hidden="true">
            <code className="block font-mono text-[13px] text-ink">print(&quot;Habari, dunia!&quot;)</code>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-ink/60">
              <span className="h-2 w-2 rounded-full bg-lime-deep" /> Python, running in your browser
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
