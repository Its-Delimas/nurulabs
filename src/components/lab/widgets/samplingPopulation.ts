// The labs' 5,000-household population, reduced to what sampling needs:
// area and whether the household has electricity (counts from households.csv).
const COUNTS = { rural: { with: 900, without: 1404 }, urban: { with: 2468, without: 228 } };

export const POPULATION: { urban: boolean; electricity: number }[] = [
  ...Array.from({ length: COUNTS.rural.with }, () => ({ urban: false, electricity: 1 })),
  ...Array.from({ length: COUNTS.rural.without }, () => ({ urban: false, electricity: 0 })),
  ...Array.from({ length: COUNTS.urban.with }, () => ({ urban: true, electricity: 1 })),
  ...Array.from({ length: COUNTS.urban.without }, () => ({ urban: true, electricity: 0 })),
];

export const TRUE_SHARE = POPULATION.reduce((s, h) => s + h.electricity, 0) / POPULATION.length;

/** Share with electricity in a simple random sample of n households (optionally urban only). */
export function sampleShare(n: number, urbanOnly = false): number {
  const frame = urbanOnly ? POPULATION.filter((h) => h.urban) : POPULATION;
  let hits = 0;
  for (let i = 0; i < n; i++) hits += frame[Math.floor(Math.random() * frame.length)].electricity;
  return hits / n;
}
