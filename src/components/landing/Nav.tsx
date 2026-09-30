"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";
import AccountButton from "@/components/auth/AccountButton";

const links = [
  { href: "#how", label: "How it works" },
  { href: "#try", label: "Try it" },
  { href: "#tracks", label: "Tracks" },
  { href: "/dashboard", label: "My learning" },
];

/** Sticky site nav; gains a surface and border once you scroll. */
export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "nav-scrolled" : "border-b border-transparent bg-cream"
      }`}
    >
      <div className="flex items-center justify-between px-6 md:px-10 xl:px-16 py-4">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                "text-ink/65 hover:text-ink"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <AccountButton />
          <Link href="/tracks" className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors">
            Start free
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
