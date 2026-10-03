"use client";

import { motion } from "framer-motion";
import SectionHeading from "@/components/ui/SectionHeading";
import { AFRICA, AFRICA_DOTS, project } from "./africa";

export interface ProjectCard {
  slug: string;
  title: string;
  track: string;
  blurb: string;
}

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

/** Projects for local clients, beside a dotted map of the places the data describes. */
export default function LocalProjects({ projects }: { projects: ProjectCard[] }) {
  return (
    <section id="projects" aria-labelledby="projects-title" className="scroll-mt-20 border-t border-ink/10 bg-paper px-4 py-20 sm:px-6 md:px-10 md:py-28 xl:px-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16">
        <div>
          <SectionHeading
            id="projects-title"
            size="lg"
            eyebrow="Local data, real problems"
            title="Learn on the problems around you."
            lede="Not another Titanic dataset. Labs use data about Kenyan farms, clinics and markets, mobile money, reviews in Swahili and English, and World Bank indicators for 20 African countries. Every module ends in a project for a realistic local client."
          />
          <ul className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {projects.map((p, i) => (
              <motion.li
                key={p.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (i % 2) * 0.05 }}
                className="border-t border-ink/10 pt-4"
              >
                <p className="text-xs font-semibold text-lime-deep">{p.track}</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/65">{p.blurb}</p>
              </motion.li>
            ))}
          </ul>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-ink/60">
            The World Bank indicators, census figures and county boundaries are real. The other datasets are illustrative,
            built to behave like the real thing.
          </p>
        </div>

        <figure className="hidden self-center sm:block">
          <svg viewBox={`-10 -10 ${AFRICA.width + 20} ${AFRICA.height + 20}`} className="mx-auto w-full max-w-[520px]" role="img" aria-label="Dotted map of Africa marking the places the labs' data comes from">
            {AFRICA_DOTS.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={5.4} className="fill-lime-deep" opacity={0.25 + ((x * 7 + y * 3) % 10) / 45} />
            ))}
            {PLACES.map((p) => {
              const [x, y] = project(p.lon, p.lat);
              const kenya = p.what !== "World Bank data";
              return (
                <g key={p.name}>
                  <circle cx={x} cy={y} r={kenya ? 15 : 12} className={kenya ? "fill-sun" : "fill-sky"} opacity={0.22} />
                  <circle cx={x} cy={y} r={kenya ? 7 : 6} className={kenya ? "fill-sun" : "fill-sky"} stroke="var(--color-paper)" strokeWidth={2.5}>
                    <title>{`${p.name}: ${p.what}`}</title>
                  </circle>
                </g>
              );
            })}
          </svg>
          <figcaption className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-ink/65">
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-sun" aria-hidden="true" /> Kenyan datasets in the labs
            </span>
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-sky" aria-hidden="true" /> Countries in the World Bank project
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
