"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Globe, Home, LayoutGrid } from "lucide-react";
import Logo from "@/components/landing/Logo";
import { enrolledTrack, trackStats } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import AccountButton from "@/components/auth/AccountButton";
import ProgressBar from "@/components/ui/ProgressBar";

/** Where the learner can go inside the app. Shared by the sidebar and the small-screen header. */
export function useAppNav() {
  const progress = useProgress();
  const track = enrolledTrack(progress);
  return {
    track,
    stats: track ? trackStats(track, progress) : null,
    items: [
      { href: "/dashboard", label: "My learning", icon: Home },
      ...(track ? [{ href: `/tracks/${track.slug}`, label: "Syllabus", icon: BookOpen }] : []),
      { href: "/tracks", label: track ? "All tracks" : "Choose a track", icon: LayoutGrid },
    ],
  };
}

export default function Sidebar() {
  const pathname = usePathname();
  const { track, stats, items } = useAppNav();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-ink/10 bg-paper md:block">
      <div className="sticky top-0 flex h-screen flex-col px-4 py-6">
        <div className="px-2">
          <Logo />
        </div>

        {track && stats && (
          <Link href={`/tracks/${track.slug}`} className="mt-8 block rounded-xl px-2 py-1 hover:bg-cream">
            <p className="text-xs text-ink/60">Enrolled</p>
            <p className="mt-0.5 font-display text-sm font-semibold text-ink">{track.name}</p>
            <div className="mt-2.5">
              <ProgressBar value={stats.percent} label={`${track.name}: ${stats.percent}% complete`} />
            </div>
            <p className="mt-1.5 text-xs text-ink/60">
              {stats.done} of {stats.total} labs · {stats.percent}%
            </p>
          </Link>
        )}

        <nav aria-label="App" className="mt-6 flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                  active ? "bg-ink text-paper" : "text-ink/70 hover:bg-cream hover:text-ink"
                }`}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-ink/10 pt-4">
          <div className="px-3 pb-2">
            <AccountButton compact />
          </div>
          <Link href="/" className="flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-ink/70 transition-colors hover:bg-cream hover:text-ink">
            <Globe size={17} />
            Back to site
          </Link>
        </div>
      </div>
    </aside>
  );
}
