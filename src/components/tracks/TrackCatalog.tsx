"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { enrolledTrack, requiredLabs, trackStats, tracks } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import ProgressBar from "@/components/ui/ProgressBar";
import PageHeader from "@/components/ui/PageHeader";
import { button } from "@/components/ui/button";
import EnrollAction from "./EnrollAction";

export default function TrackCatalog() {
  const progress = useProgress();
  const current = enrolledTrack(progress);

  return (
    <div>
      <PageHeader
        eyebrow="Free programmes"
        title={current ? "All tracks" : "Choose your track"}
        lede={
          current
            ? "One track at a time: finish the one you're on to open the next."
            : "Enroll in one track, follow its syllabus milestone by milestone, and finish it before starting the next. New to code? Start with Python Essentials: everything else builds on it."
        }
      />

      <div className="mt-8 space-y-4">
        {tracks.map((track, i) => {
          const labs = requiredLabs(track);
          const projects = labs.filter((l) => l.kind === "project").length;
          const modules = track.modules.filter((m) => !m.optional).length;
          const stats = trackStats(track, progress);
          const isCurrent = current?.slug === track.slug;
          const soon = track.status === "coming-soon";
          const after = track.requires?.map((r) => tracks.find((t) => t.slug === r)?.name).join(", ");
          return (
            <motion.article
              key={track.slug}
              aria-labelledby={`track-${track.slug}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`grid grid-cols-1 overflow-hidden rounded-2xl md:grid-cols-[240px_minmax(0,1fr)] ${
                isCurrent ? "bg-paper ring-2 ring-lime-deep" : soon ? "border border-dashed border-ink/20" : "bg-paper ring-1 ring-ink/10"
              }`}
            >
              <div className="relative aspect-[16/9] bg-mist md:aspect-auto md:min-h-48">
                {track.cover && <Image src={track.cover.src} alt={track.cover.alt} fill sizes="(min-width: 768px) 240px, 100vw" className="object-cover" />}
                {isCurrent && <span className="absolute top-3 left-3 rounded-md bg-lime px-2.5 py-1 text-xs font-semibold text-onlime">Enrolled</span>}
              </div>
              <div className="p-6 md:p-7">
                <p className="text-sm text-ink/60">
                  {track.level} · {after ? `after ${after}` : "no experience needed"}
                </p>
                <h2 id={`track-${track.slug}`} className={`mt-1 font-display text-2xl font-semibold ${soon ? "text-ink/55" : "text-ink"}`}>
                  {track.name}
                </h2>
                <p className={`mt-2 max-w-2xl text-sm leading-relaxed ${soon ? "text-ink/55" : "text-ink/70"}`}>{track.description}</p>

                {!soon && (
                  <p className="mt-4 text-sm text-ink/60">
                    <strong className="font-semibold text-ink">{labs.length}</strong> labs · <strong className="font-semibold text-ink">{projects}</strong>{" "}
                    {projects === 1 ? "project" : "projects"} · <strong className="font-semibold text-ink">{modules}</strong> modules
                  </p>
                )}

                {isCurrent && (
                  <div className="mt-5 max-w-sm">
                    <ProgressBar value={stats.percent} label={`${track.name}: ${stats.percent}% complete`} />
                    <p className="mt-2 text-sm text-ink/60">
                      {stats.done} of {stats.total} labs complete
                    </p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
                  <EnrollAction track={track} progress={progress} />
                  <Link href={`/tracks/${track.slug}`} className={button({ variant: "secondary" })}>
                    {soon ? "Planned syllabus" : "Syllabus"}
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
