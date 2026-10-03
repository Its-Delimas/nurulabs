"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/landing/Logo";
import Sidebar, { useAppNav } from "./Sidebar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AccountButton from "@/components/auth/AccountButton";

/** Layout for the learner's side of the app: their learning and the tracks. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { items } = useAppNav();

  return (
    <div className="flex min-h-screen flex-col bg-cream md:flex-row">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper md:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <Logo />
          <AccountButton compact />
        </div>
        <nav aria-label="App" className="flex gap-1 overflow-x-auto px-3 pb-2">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${
                  active ? "bg-ink text-paper" : "text-ink/70 hover:bg-cream hover:text-ink"
                }`}
              >
                <item.icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <Sidebar />
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <main className="w-full flex-1 px-4 py-8 sm:px-6 md:px-8 xl:px-10">{children}</main>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-4 py-4 sm:px-6 md:px-8 xl:px-10">
          <p className="text-xs text-ink/60">Nurulabs is free to learn.</p>
          <ThemeToggle />
        </footer>
      </div>
    </div>
  );
}
