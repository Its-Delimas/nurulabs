import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import TryIt from "@/components/landing/TryIt";
import Path from "@/components/landing/Path";
import LocalProjects from "@/components/landing/LocalProjects";
import Free from "@/components/landing/Free";
import PhotoBand from "@/components/landing/PhotoBand";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { trackLabs, tracks } from "@/lib/curriculum";

export default function Home() {
  // Computed at build time on the server: only the numbers reach the browser.
  const openLabs = [...new Map(tracks.filter((t) => t.status === "active").flatMap(trackLabs).map((l) => [l.slug, l])).values()];
  const activities = openLabs.reduce((n, l) => n + l.steps.length, 0);
  const labCounts = Object.fromEntries(tracks.map((t) => [t.slug, trackLabs(t).length]));

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero liveLabs={openLabs.length} activities={activities} />
        <TryIt />
        <HowItWorks />
        <PhotoBand />
        <Path labCounts={labCounts} />
        <LocalProjects />
        <Free />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
