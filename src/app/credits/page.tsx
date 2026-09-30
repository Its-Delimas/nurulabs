import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";
import { creditsIssueUrl, mapCredits, photoCredits } from "@/lib/credits";

export const metadata: Metadata = {
  title: "Credits — Nurulabs",
  description: "The photographers and open data behind Nurulabs, and how to ask for a credit change or removal.",
};

const licencePoints = [
  { title: "Free to use", body: "Photos can be used for free, for personal or commercial work, without asking the photographer first." },
  { title: "Credit is optional, so we give it anyway", body: "The licence doesn't require attribution. We credit every photographer here because their work makes these pages feel like home." },
  { title: "Some things aren't allowed", body: "You can't sell a photo unchanged, or collect Unsplash photos to build a similar or competing photo service. We do neither." },
  { title: "People and places stay theirs", body: "The licence covers the photograph, not the people, brands or places in it. We use photos only to illustrate lessons, never to suggest anyone pictured endorses Nurulabs." },
];

export default function CreditsPage() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-cream pt-28 text-ink md:pt-36">
        <section className="px-6 md:px-10 xl:px-16">
          <p className="eyebrow text-lime-deep">Credits</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Thank you to the photographers behind Nurulabs.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink/65">
            Nurulabs teaches with local problems: market prices, farms, clinics, mobile money. The photos on these pages show that
            world, and many of them were taken by African photographers who chose to share their work freely on Unsplash. We&apos;re
            grateful to every one of them.
          </p>
        </section>

        <section className="mt-20 grid gap-12 border-t border-ink/10 px-6 pt-16 md:px-10 lg:grid-cols-[1fr_1.4fr] xl:px-16">
          <div>
            <p className="eyebrow text-ink/45">Why Unsplash</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">Free photos, shared on purpose</h2>
            <p className="mt-4 max-w-md leading-relaxed text-ink/65">
              Nurulabs is free to learn, so we use photos that are free to use too. Unsplash is a library of photos that photographers
              upload for anyone to use under the Unsplash License, and it has a growing collection from across Africa. Here is what
              that licence means, in short.
            </p>
            <a
              href="https://unsplash.com/license"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-lime-deep hover:underline"
            >
              Read the full Unsplash License <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-2xl bg-ink/10 sm:grid-cols-2">
            {licencePoints.map((p) => (
              <li key={p.title} className="bg-paper p-6">
                <p className="font-display text-lg font-semibold">{p.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{p.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="removal" className="mt-20 px-6 md:px-10 xl:px-16">
          <div className="flex flex-col gap-6 rounded-2xl bg-lime-soft p-8 ring-1 ring-lime-deep/20 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-2xl">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Is this your photo, or are you in one?</h2>
              <p className="mt-3 leading-relaxed text-ink/70">
                If a credit is wrong, you&apos;d like a different link, or you want a photo taken down for any reason, tell us and
                we&apos;ll fix it or remove it as soon as we see your message. You don&apos;t need to give a reason.
              </p>
            </div>
            <a
              href={creditsIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-semibold text-paper"
            >
              Request a change <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
          <p className="mt-3 text-xs text-ink/45">Requests are made through a GitHub issue on the Nurulabs project.</p>
        </section>

        <section className="mt-20 px-6 md:px-10 xl:px-16">
          <p className="eyebrow text-ink/45">Photos</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">Every photo, and who took it</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {photoCredits.map((p) => (
              <li key={p.file} className="overflow-hidden rounded-2xl bg-paper ring-1 ring-ink/10">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={`/images/${p.file}`}
                    alt={p.shows}
                    fill
                    sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="font-display font-semibold">{p.photographer}</p>
                  <p className="mt-1 text-sm text-ink/65">
                    {p.shows}
                    {p.place ? `, ${p.place}` : ""}
                  </p>
                  <p className="mt-3 text-xs text-ink/45">Used on: {p.usedOn}</p>
                  <a
                    href={`https://unsplash.com/photos/${p.unsplashId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-lime-deep hover:underline"
                  >
                    View on Unsplash <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20 px-6 pb-24 md:px-10 md:pb-32 xl:px-16">
          <p className="eyebrow text-ink/45">Maps</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight">Map data</h2>
          <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
            {mapCredits.map((m) => (
              <li key={m.what} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium">{m.what}</span>
                <span className="text-sm text-ink/60">
                  <a href={m.href} target="_blank" rel="noopener noreferrer" className="text-lime-deep hover:underline">
                    {m.source}
                  </a>{" "}
                  · {m.licence}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
