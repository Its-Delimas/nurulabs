import Link from "next/link";
import Logo from "@/components/landing/Logo";
import Sidebar from "./Sidebar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import AccountButton from "@/components/auth/AccountButton";

/** Layout for the signed-in-feeling side of the app: dashboard and tracks. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-cream md:flex-row">
      <header className="flex items-center justify-between border-b border-ink/10 bg-paper px-5 py-4 md:hidden">
        <Logo />
        <nav className="flex items-center gap-4 text-sm font-medium text-ink/60">
          <Link href="/dashboard">Home</Link>
          <Link href="/tracks">Tracks</Link>
          <AccountButton compact />
        </nav>
      </header>
      <Sidebar />
      <div className="flex w-full min-w-0 flex-1 flex-col">
        <main className="w-full flex-1 px-5 py-8 md:px-8 xl:px-10">{children}</main>
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 px-5 py-4 md:px-8 xl:px-10">
          <p className="text-xs text-ink/40">Nurulabs — free to learn.</p>
          <ThemeToggle />
        </footer>
      </div>
    </div>
  );
}
