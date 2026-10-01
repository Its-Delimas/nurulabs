import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Compass, Home } from "lucide-react";
import Nav from "@/components/landing/Nav";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = { title: "Page not found — Nurulabs" };

const routes = [
  { href: "/tracks", icon: Compass, title: "Choose a track", body: "Python, Data Science, Data Engineering or AI & ML." },
  { href: "/dashboard", icon: BookOpen, title: "My learning", body: "Pick up your next lab where you left off." },
  { href: "/", icon: Home, title: "Home", body: "See how Nurulabs works." },
];

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="flex-1 bg-cream px-6 pb-24 pt-28 text-ink md:px-10 md:pt-36 xl:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div>
            <p className="eyebrow text-lime-deep">Error 404</p>
            <h1 className="mt-4 font-display text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">This page doesn&apos;t exist.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/60">
              The link may be old, or the address mistyped. Your progress is safe. Here&apos;s where you can go instead.
            </p>
            <ul className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {routes.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="group flex h-full flex-col rounded-2xl bg-paper p-5 ring-1 ring-ink/10 transition-colors hover:ring-ink/30">
                    <r.icon size={20} className="text-lime-deep" />
                    <span className="mt-4 inline-flex items-center gap-1.5 font-display font-semibold">
                      {r.title}
                      <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-1 text-sm text-ink/55">{r.body}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] ring-1 ring-ink/10">
            <Image src="/images/lost-page.webp" alt="A young man working on a laptop in a bright office" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
