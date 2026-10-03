/**
 * The one button style, as classes, so <button>, <Link> and <a> all look
 * and behave the same:  <Link href="/x" className={button({ size: "lg" })}>
 *
 *   primary   — the main action on a screen (one per screen where possible)
 *   accent    — the main action on a dark or photographic background
 *   secondary — an alternative action beside a primary one
 *   ghost     — low-emphasis actions in toolbars and menus
 *
 * Don't override padding or height through `className`: two utilities for the
 * same property don't reliably override each other. Add a size instead.
 */
type Variant = "primary" | "accent" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg" | "icon";

const base =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold transition-colors disabled:pointer-events-none disabled:opacity-40 [&_svg]:shrink-0";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-ink/85",
  accent: "bg-lime text-onlime hover:bg-lime/85",
  secondary: "bg-paper text-ink ring-1 ring-inset ring-ink/15 hover:bg-cream hover:ring-ink/30",
  ghost: "text-ink/70 hover:bg-ink/5 hover:text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[15px]",
  /** A square button holding just an icon; give it an aria-label. */
  icon: "h-9 w-9",
};

export function button({ variant = "primary", size = "md", className = "" }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}
