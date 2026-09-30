"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Globe, Home, LayoutGrid } from "lucide-react";
import Logo from "@/components/landing/Logo";
import { enrolledTrack, trackStats } from "@/lib/curriculum";
import { useProgress } from "@/lib/progress";
import AccountButton from "@/components/auth/AccountButton";

export default function Sidebar() {
  const pathname = usePathname();
  const progress = useProgress();
  const track = enrolledTrack(progress);
  const stats = track ? trackStats(track, progress) : null;

  const items = [
    { href: "/dashboard", label: "Home", icon: Home },
    ...(track ? [{ href: `/tracks/${track.slug}`, label: "Syllabus", icon: BookOpen }] : []),
    { href: "/tracks", label: track ? "All tracks" : "Choose a track", icon: LayoutGrid },
  ];

  return (
    <aside className="hidden w-64 shrink-0 p-4 md:block">
      <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col rounded-3xl bg-paper px-4 py-7 ring-1 ring-ink/10">
        <div className="px-3">
          <Logo />
        </div>

        {track && stats && (
          <div className="mt-8 rounded-2xl bg-cream p-4">
            <p className="eyebrow text-ink/40">Enrolled</p>
            <p className="mt-1 font-display text-sm font-semibold text-ink">{track.name}</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
              <div className="h-full rounded-full bg-lime" style={{ width: `${stats.percent}%` }} />
            </div>
            <p className="mt-2 text-[11px] text-ink/50">
              {stats.done} of {stats.total} labs · {stats.percent}%
            </p>
          </div>
        )}

        <nav className="mt-6 flex flex-col gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-ink text-paper" : "text-ink/55 hover:bg-cream hover:text-ink"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-ink/10 pt-4">
          <div className="px-3 pb-3">
            <AccountButton compact />
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/55 transition-colors hover:bg-cream hover:text-ink"
          >
            <Globe size={18} />
            Back to site
          </Link>
        </div>
      </div>
    </aside>
  );
}
