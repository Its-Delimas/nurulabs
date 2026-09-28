import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LabPlayer from "@/components/lab/LabPlayer";
import { getLab } from "@/lib/curriculum";
import { allLabs } from "@/lib/curriculum/labs";

export function generateStaticParams() {
  return allLabs.map((lab) => ({ slug: lab.slug }));
}

export async function generateMetadata({ params }: PageProps<"/labs/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lab = getLab(slug);
  return { title: lab ? `${lab.title} — Nurulabs` : "Lab not found — Nurulabs" };
}

export default async function LabPage({ params }: PageProps<"/labs/[slug]">) {
  const { slug } = await params;
  // Full content, on the server: only this one lab is sent to the browser.
  const lab = allLabs.find((l) => l.slug === slug);
  if (!lab) notFound();
  return <LabPlayer lab={lab} />;
}
