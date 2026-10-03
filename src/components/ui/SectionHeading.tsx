/**
 * A section's eyebrow, title and optional lede. "lg" is for marketing pages
 * (the landing page); "md" for sections inside the app.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lede,
  size = "md",
  align = "left",
  id,
}: {
  eyebrow: string;
  title: string;
  lede?: React.ReactNode;
  size?: "md" | "lg";
  align?: "left" | "center";
  /** For aria-labelledby on the section. */
  id?: string;
}) {
  const lg = size === "lg";
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow text-lime-deep">{eyebrow}</p>
      <h2
        id={id}
        className={
          lg
            ? "mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-balance text-ink md:text-[2.75rem] md:leading-[1.1]"
            : "mt-2 font-display text-2xl font-semibold tracking-tight text-balance text-ink md:text-3xl"
        }
      >
        {title}
      </h2>
      {lede && <p className={lg ? "mt-4 text-lg leading-relaxed text-ink/70" : "mt-2 leading-relaxed text-ink/65"}>{lede}</p>}
    </div>
  );
}
