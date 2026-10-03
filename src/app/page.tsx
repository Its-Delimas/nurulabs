import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Method from "@/components/landing/Method";
import TryIt from "@/components/landing/TryIt";
import Path from "@/components/landing/Path";
import LocalProjects, { type ProjectCard } from "@/components/landing/LocalProjects";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { getLab, requiredLabs, trackLabs, trackOfLab, tracks } from "@/lib/curriculum";

// One or two projects from each track, with a line on the job to be done.
const FEATURED: { slug: string; blurb: string }[] = [
  { slug: "py-project-chama", blurb: "Settle a savings group's arguments about who owes what, from payments typed into a phone." },
  { slug: "py-project-wallet", blurb: "Model wallets, fees and transfers that never lose a shilling." },
  { slug: "school-results", blurb: "Work out how much of a school programme's jump in exam scores it really caused." },
  { slug: "crop-prices-pipeline", blurb: "Build the weekly pipeline that tells a Kitale cooperative where its crops fetch the best price." },
  { slug: "crop-early-warning", blurb: "Tell a county agriculture office which maize fields to visit before blight spreads." },
  { slug: "fraud-watch", blurb: "Fill a fraud team's daily review queue, with no fraud labels to learn from." },
];

export default function Home() {
  // Computed at build time on the server: only the numbers reach the browser.
  const live = tracks.filter((t) => t.status === "active");
  const openLabs = [...new Map(live.flatMap(trackLabs).map((l) => [l.slug, l])).values()];
  const activities = openLabs.reduce((n, l) => n + l.steps.length, 0);
  const facts = Object.fromEntries(
    tracks.map((t) => {
      const labs = requiredLabs(t);
      return [t.slug, { labs: labs.length, projects: labs.filter((l) => l.kind === "project").length, modules: t.modules.filter((m) => !m.optional).length }];
    }),
  );
  const projects: ProjectCard[] = FEATURED.flatMap(({ slug, blurb }) => {
    const lab = getLab(slug);
    const track = trackOfLab(slug);
    return lab && track ? [{ slug, blurb, title: lab.title, track: track.name }] : [];
  });

  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero tracks={live.length} liveLabs={openLabs.length} activities={activities} />
        <Method />
        <TryIt />
        <Path facts={facts} />
        <LocalProjects projects={projects} />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
