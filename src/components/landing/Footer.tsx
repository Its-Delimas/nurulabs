import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";

const columns = [
  {
    title: "Learn",
    links: [
      { href: "/tracks", label: "Choose a track" },
      { href: "/tracks/python-for-ai", label: "Python for AI" },
      { href: "/tracks/ai-ml", label: "AI & Machine Learning" },
      { href: "/tracks/data-science", label: "Data Science" },
      { href: "/placement/python-for-ai", label: "Python placement check" },
    ],
  },
  {
    title: "Nurulabs",
    links: [
      { href: "/#how", label: "How it works" },
      { href: "/#try", label: "Try an interactive" },
      { href: "/#why", label: "Why Nurulabs" },
      { href: "/dashboard", label: "My learning" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-paper text-ink">
      <div className="grid gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10 xl:px-16">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/55">
            Africa&apos;s hands-on AI academy. Free to learn, starting with Python for AI.
          </p>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <p className="eyebrow text-ink/40">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink/65 transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 px-6 py-5 md:px-10 xl:px-16">
        <p className="text-xs text-ink/40">
          Photography from Unsplash — credits in <code className="font-mono">public/images/CREDITS.md</code>.
        </p>
        <ThemeToggle />
      </div>
    </footer>
  );
}
