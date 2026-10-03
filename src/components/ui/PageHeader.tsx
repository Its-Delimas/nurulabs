/** The top of an app page: an optional eyebrow, the page's one h1, and a lede. */
export default function PageHeader({ eyebrow, title, lede }: { eyebrow?: string; title: string; lede?: React.ReactNode }) {
  return (
    <header className="max-w-3xl">
      {eyebrow && <p className="eyebrow text-lime-deep">{eyebrow}</p>}
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-balance text-ink md:text-4xl">{title}</h1>
      {lede && <p className="mt-3 text-lg leading-relaxed text-ink/70">{lede}</p>}
    </header>
  );
}
