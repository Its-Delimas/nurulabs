"use client";

import { motion } from "framer-motion";
import { AFRICA, AFRICA_DOTS, project } from "./africa";

// Places the labs' datasets come from or describe.
const PLACES: { name: string; lon: number; lat: number; what: string }[] = [
  { name: "Nairobi", lon: 36.82, lat: -1.29, what: "clinic records, mobile money, census" },
  { name: "Kisumu", lon: 34.77, lat: -0.09, what: "maize prices, malaria" },
  { name: "Nakuru", lon: 36.07, lat: -0.3, what: "farm yields" },
  { name: "Lodwar", lon: 35.6, lat: 3.12, what: "clinic records" },
  { name: "Mombasa", lon: 39.67, lat: -4.04, what: "clinic records" },
  { name: "Kampala", lon: 32.58, lat: 0.35, what: "World Bank data" },
  { name: "Kigali", lon: 30.06, lat: -1.95, what: "World Bank data" },
  { name: "Addis Ababa", lon: 38.76, lat: 9.03, what: "World Bank data" },
  { name: "Lagos", lon: 3.38, lat: 6.52, what: "World Bank data" },
  { name: "Accra", lon: -0.19, lat: 5.6, what: "World Bank data" },
  { name: "Dakar", lon: -17.45, lat: 14.69, what: "World Bank data" },
  { name: "Kinshasa", lon: 15.27, lat: -4.44, what: "World Bank data" },
  { name: "Lusaka", lon: 28.28, lat: -15.42, what: "World Bank data" },
  { name: "Johannesburg", lon: 28.05, lat: -26.2, what: "World Bank data" },
  { name: "Cairo", lon: 31.24, lat: 30.04, what: "World Bank data" },
];

/** The numbers, beside a dotted map of the places the data describes. */
export default function Impact({ liveLabs, activities, tracks }: { liveLabs: number; activities: number; tracks: number }) {
  const stats = [
    { value: String(liveLabs), label: "hands-on labs, free" },
    { value: `${activities}+`, label: "lessons, interactives and exercises" },
    { value: String(tracks), label: "structured tracks, with milestones" },
    { value: "0", label: "things to install" },
  ];
  return (
    <section className="relative overflow-hidden bg-cream px-6 py-24 md:px-10 xl:px-16">
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <p className="eyebrow text-lime-deep">Local data, real problems</p>
          <h2 className="mt-4 max-w-lg font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">Learn on the problems around you.</h2>
          <p className="mt-5 max-w-lg text-ink/60">
            Labs use data about Kenyan farms, clinics and markets, reviews in Swahili and English, real census and
            county boundaries, and World Bank indicators for 20 African countries.
          </p>
          <div className="mt-10 grid max-w-lg grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="rounded-3xl bg-paper p-6 ring-1 ring-ink/5">
                <p className="font-display text-3xl font-semibold text-ink">{s.value}</p>
                <p className="mt-1 text-sm text-ink/55">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-[600px]">
          <svg viewBox={`-10 -10 ${AFRICA.width + 20} ${AFRICA.height + 20}`} className="w-full" role="img" aria-label="Dotted map of Africa with the places the labs' data comes from">
            {AFRICA_DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5.4} className="fill-lime-deep" opacity={0.28 + ((x * 7 + y * 3) % 10) / 40} />)}
            {PLACES.map((p) => {
              const [x, y] = project(p.lon, p.lat);
              const kenya = p.what !== "World Bank data";
              return (
                <g key={p.name}>
                  <circle cx={x} cy={y} r={kenya ? 16 : 12} className={kenya ? "fill-sun" : "fill-sky"} opacity={0.25}>
                    <animate attributeName="r" values={kenya ? "10;20;10" : "8;15;8"} dur="3s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy={y} r={kenya ? 7 : 6} className={kenya ? "fill-sun" : "fill-sky"} stroke="var(--color-paper)" strokeWidth={2.5}>
                    <title>{`${p.name}: ${p.what}`}</title>
                  </circle>
                </g>
              );
            })}
          </svg>
          <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-ink/55">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-sun" /> Kenyan datasets in the labs</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-sky" /> Countries in the World Bank capstone</span>
          </div>
        </div>
      </div>
    </section>
  );
}
