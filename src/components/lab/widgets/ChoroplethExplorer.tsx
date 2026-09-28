"use client";

import { useEffect, useMemo, useState } from "react";

type Geometry = { type: "Polygon"; coordinates: number[][][] } | { type: "MultiPolygon"; coordinates: number[][][][] };
interface County { county: string; population_2019: number; area_km2: number }

const METRICS = {
  population_2019: { label: "population (2019 census)", fmt: (v: number) => `${(v / 1e6).toFixed(2)}M` },
  area_km2: { label: "area (km²)", fmt: (v: number) => `${Math.round(v).toLocaleString()} km²` },
  density: { label: "people per km²", fmt: (v: number) => `${Math.round(v).toLocaleString()}/km²` },
} as const;
type Metric = keyof typeof METRICS;
type Scheme = "equal" | "quantile";
const SHADES = ["#eef4dd", "#c9dd9a", "#9dbd52", "#6f9425", "#3f5a0c"];

/** Real Kenya county boundaries, three measures, two ways to colour them. */
export default function ChoroplethExplorer({ onInteract }: { onInteract: () => void }) {
  const [geo, setGeo] = useState<{ county: string; geometry: Geometry }[] | null>(null);
  const [table, setTable] = useState<Record<string, County>>({});
  const [metric, setMetric] = useState<Metric>("density");
  const [scheme, setScheme] = useState<Scheme>("equal");
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    // Fetched on demand, like the lab's own data — never bundled.
    Promise.all([fetch("/data/kenya-counties.geojson").then((r) => r.json()), fetch("/data/counties.csv").then((r) => r.text())]).then(([g, csv]) => {
      setGeo(g.features.map((f: { properties: { county: string }; geometry: Geometry }) => ({ county: f.properties.county, geometry: f.geometry })));
      const rows = csv.trim().split("\n").slice(1).map((l: string) => l.split(","));
      setTable(Object.fromEntries(rows.map((r: string[]) => [r[1], { county: r[1], population_2019: +r[3], area_km2: +r[4] }])));
    }).catch(() => setGeo([]));
  }, []);

  const value = (c: string) => {
    const t = table[c];
    if (!t) return NaN;
    return metric === "density" ? t.population_2019 / t.area_km2 : t[metric];
  };

  const breaks = useMemo(() => {
    const vals = Object.keys(table).map(value).filter((v) => !Number.isNaN(v)).sort((a, b) => a - b);
    if (!vals.length) return [];
    if (scheme === "equal") {
      const lo = vals[0], hi = vals[vals.length - 1];
      return [1, 2, 3, 4].map((i) => lo + ((hi - lo) * i) / 5);
    }
    return [1, 2, 3, 4].map((i) => vals[Math.floor((vals.length * i) / 5)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, metric, scheme]);

  const colour = (v: number) => SHADES[breaks.filter((b) => v >= b).length];

  // Project lon/lat to the SVG (simple equirectangular; fine at Kenya's latitude).
  const W = 420, H = 480, lon0 = 33.8, lon1 = 42.0, lat0 = -4.8, lat1 = 5.1;
  const pt = ([x, y]: number[]) => `${(((x - lon0) / (lon1 - lon0)) * W).toFixed(1)},${(((lat1 - y) / (lat1 - lat0)) * H).toFixed(1)}`;
  const d = (g: Geometry) => (g.type === "Polygon" ? [g.coordinates] : g.coordinates).map((poly) => poly.map((ring) => `M${ring.map(pt).join("L")}Z`).join("")).join("");

  if (!geo) return <div className="h-80 animate-pulse rounded-2xl bg-ink/5" />;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md rounded-2xl bg-paper ring-1 ring-ink/10" role="img" aria-label="Map of Kenya's counties">
        {geo.map((f) => (
          <path key={f.county} d={d(f.geometry)} fill={colour(value(f.county))} stroke="var(--color-paper)" strokeWidth={0.8}
            onMouseEnter={() => { setHover(f.county); onInteract(); }} onMouseLeave={() => setHover(null)} className="cursor-pointer" />
        ))}
      </svg>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(METRICS) as Metric[]).map((m) => (
            <button key={m} type="button" onClick={() => { setMetric(m); onInteract(); }} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${metric === m ? "bg-ink text-paper ring-ink" : "text-ink/60 ring-ink/15"}`}>{METRICS[m].label}</button>
          ))}
        </div>
        <div className="inline-flex rounded-xl bg-ink/5 p-1">
          {(["equal", "quantile"] as Scheme[]).map((s) => (
            <button key={s} type="button" onClick={() => { setScheme(s); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${scheme === s ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
              {s === "equal" ? "equal-width classes" : "quantiles (equal counts)"}
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-paper p-4 ring-1 ring-ink/10">
          <p className="text-xs text-ink/50">{hover ?? "Hover a county"}</p>
          <p className="font-mono text-lg text-ink">{hover ? METRICS[metric].fmt(value(hover)) : "—"}</p>
        </div>
        <div className="flex items-center gap-1">
          {SHADES.map((s, i) => <span key={s} className="h-3 flex-1 rounded-sm" style={{ background: s }} title={i === 0 ? `< ${METRICS[metric].fmt(breaks[0] ?? 0)}` : `≥ ${METRICS[metric].fmt(breaks[i - 1] ?? 0)}`} />)}
        </div>
        <p className="text-xs leading-relaxed text-ink/55">
          Real county boundaries (geoBoundaries, public domain) and 2019 census populations. With equal-width classes, Nairobi and Mombasa&apos;s extreme density turns almost every other county the palest shade; quantiles spread the colours but hide how extreme those two are. Neither is wrong — the classification is a choice that changes the story.
        </p>
      </div>
    </div>
  );
}
