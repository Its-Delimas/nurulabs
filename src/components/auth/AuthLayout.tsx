import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import Logo from "@/components/landing/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";

const BENEFITS = [
  "Pick up where you left off on any phone or computer",
  "Keep your labs, milestones and streak if you clear your browser",
  "Free to learn, from the first lab to the last",
];

/** Full-screen split layout for sign-in: a photo panel with what an account gives you, and the form. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen bg-cream text-ink lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative isolate flex min-h-64 flex-col justify-between overflow-hidden p-6 text-white md:p-10 lg:min-h-screen">
        <Image
          src="/images/signin-learner.webp"
          alt="A young man working on a laptop at a desk in Abuja"
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="-z-20 object-cover object-[center_30%]"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/45 to-black/25" />
        <Logo light />
        <div className="mt-16 max-w-lg">
          <p className="eyebrow text-lime">Free to learn</p>
          <p className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Your progress, saved on every device you learn on.
          </p>
          <ul className="mt-6 hidden space-y-3 sm:block">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm text-white/85">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lime text-onlime">
                  <Check size={12} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-col px-6 py-6 md:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 hover:text-ink">
            <ArrowLeft size={15} /> Back to Nurulabs
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center py-12">
          <div className="mx-auto w-full max-w-sm">{children}</div>
        </div>
        <p className="text-xs text-ink/45">
          Signing in saves your learning progress to your account. Learning without one works too. Photo:{" "}
          <Link href="/credits" className="underline underline-offset-2 hover:text-ink">
            credits
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
