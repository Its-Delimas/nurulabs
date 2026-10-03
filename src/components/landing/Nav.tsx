"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import AccountButton from "@/components/auth/AccountButton";
import { authEnabled } from "@/lib/supabase/config";
import { button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#try", label: "Try it" },
  { href: "/#tracks", label: "Tracks" },
];

/**
 * The site header. Its main button follows the visitor: "Start learning" for
 * someone new, "My learning" once they have progress. On small screens the
 * links fold into a menu.
 */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const progress = useProgress();
  const started = !!progress?.enrolled || Object.keys(progress?.labs ?? {}).length > 0;
  const cta = started ? { href: "/dashboard", label: "My learning" } : { href: "/tracks/python-essentials", label: "Start learning" };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-200 ${
        scrolled || open ? "nav-scrolled" : "border-b border-transparent bg-cream"
      }`}
    >
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 md:h-[72px] md:px-10 xl:px-16">
        <Logo />
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={button({ variant: "ghost", size: "sm" })}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <AccountButton />
          </div>
          <Link href={cta.href} className={button({ size: "sm" })}>
            {cta.label}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className={button({ variant: "ghost", size: "icon", className: "md:hidden" })}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="site-menu" aria-label="Main" className="border-t border-ink/10 px-4 pt-2 pb-4 sm:px-6 md:hidden">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setOpen(false)} className="flex h-12 items-center text-[15px] font-medium text-ink">
                  {link.label}
                </a>
              </li>
            ))}
            {!started && (
              <li>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="flex h-12 items-center text-[15px] font-medium text-ink">
                  My learning
                </Link>
              </li>
            )}
          </ul>
          {authEnabled && (
            <div className="mt-2 border-t border-ink/10 pt-4 sm:hidden">
              <AccountButton />
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
