"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Leaf, Car, Smartphone, Scale, MessageSquareText, Images } from "lucide-react";

const mosaic = [
  { src: "/images/maize-field.jpg", alt: "A field of young maize under a blue sky", caption: "AI & ML Lab 09", sub: "Predict maize yield from rainfall" },
  { src: "/images/lamu-market.jpg", alt: "A busy covered produce market in Lamu, Kenya", caption: "AI & ML capstone", sub: "Forecast market prices, with honest error bars" },
  { src: "/images/nairobi-skyline.jpg", alt: "Nairobi's skyline at golden hour", caption: "AI & ML capstone", sub: "Audit a lending model for fairness" },
];

// Capstones that are live today, then what's still on the roadmap.
const projects = [
  { icon: Leaf, live: true, title: "Blight early warning", body: "Flag farms at risk of crop disease before it spreads, and plan extension visits." },
  { icon: Smartphone, live: true, title: "Mobile-money fraud watch", body: "Find suspicious transactions with no fraud labels, using anomaly detection." },
  { icon: MessageSquareText, live: true, title: "Swahili & English feedback assistant", body: "Flag unhappy customers, find what they complain about, and draft grounded replies." },
  { icon: Scale, live: true, title: "Responsible lending audit", body: "Measure and reduce a credit model's bias against rural applicants, then publish a model card." },
  { icon: Images, live: false, title: "Crop disease from photos", body: "Identify disease in cassava and maize leaves from pictures taken on a phone." },
  { icon: Car, live: false, title: "Nairobi traffic prediction", body: "Forecast congestion on major routes from historical trip data." },
];

export default function LocalProjects() {
  return (
    <section id="projects" className="bg-cream pb-24 md:pb-32">
      <div className="grid grid-cols-1 gap-px bg-cream sm:grid-cols-3">
        {mosaic.map((m, i) => (
          <motion.figure
            key={m.src}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            className="group relative aspect-[4/3] overflow-hidden sm:aspect-[3/4] lg:aspect-[4/5]"
          >
            <Image
              src={m.src}
              alt={m.alt}
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-black/70 px-6 py-5 text-white">
              <p className="eyebrow text-lime">{m.caption}</p>
              <p className="mt-1 font-display text-lg font-semibold">{m.sub}</p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
      <div className="px-6 md:px-10 xl:px-16 pt-24 md:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="eyebrow text-lime-deep"
        >
          Local data, local problems
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight text-ink md:text-4xl"
        >
          Not another Titanic dataset.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-5 max-w-2xl text-ink/55"
        >
          The labs use data about places you know — Nakuru farms, Kisumu
          maize prices, mobile-money customers, reviews in Swahili and
          English. Each module ends in a capstone for a realistic local
          client. The datasets are illustrative, built to behave like the
          real thing; a few more projects are still on the roadmap.
        </motion.p>

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
              className="bg-paper p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-paper text-ink/50">
                  <project.icon size={18} />
                </div>
                <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${project.live ? "bg-lime-soft text-lime-deep" : "bg-cream text-ink/40"}`}>
                  {project.live ? "Live capstone" : "Planned"}
                </span>
              </div>
              <h3 className={`mt-4 font-display text-base font-semibold ${project.live ? "text-ink" : "text-ink/60"}`}>
                {project.title}
              </h3>
              <p className={`mt-2 text-sm leading-relaxed ${project.live ? "text-ink/60" : "text-ink/45"}`}>
                {project.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
