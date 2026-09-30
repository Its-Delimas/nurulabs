import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Why from "@/components/landing/Why";
import Method from "@/components/landing/Method";
import TryIt from "@/components/landing/TryIt";
import Path from "@/components/landing/Path";
import LocalProjects from "@/components/landing/LocalProjects";
import Impact from "@/components/landing/Impact";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { requiredLabs, trackLabs, tracks } from "@/lib/curriculum";

export default function Home() {
  // Computed at build time on the server: only the numbers reach the browser.
  const live = tracks.filter((t) => t.status === "active");
  const openLabs = [...new Map(live.flatMap(trackLabs).map((l) => [l.slug, l])).values()];
  const activities = openLabs.reduce((n, l) => n + l.steps.length, 0);
  const facts = Object.fromEntries(
    tracks.map((t) => {
      const labs = requiredLabs(t);
      return [t.slug, { labs: labs.length, projects: labs.filter((l) => l.kind === "project").length }];
    }),
  );

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero liveLabs={openLabs.length} activities={activities} />
        <Why />
        <Method />
        <TryIt />
        <Path facts={facts} />
        <LocalProjects />
        <Impact liveLabs={openLabs.length} activities={activities} tracks={live.length} />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
