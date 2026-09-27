import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AppShell from "@/components/dashboard/AppShell";
import TrackView from "@/components/tracks/TrackView";
import { getTrack, tracks } from "@/lib/curriculum";

export function generateStaticParams() {
  return tracks.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tracks/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const track = getTrack(slug);
  return { title: track ? `${track.name} — Nurulabs` : "Track not found — Nurulabs" };
}

export default async function TrackPage({ params }: PageProps<"/tracks/[slug]">) {
  const { slug } = await params;
  const track = getTrack(slug);
  if (!track) notFound();
  return (
    <AppShell>
      <TrackView track={track} />
    </AppShell>
  );
}
