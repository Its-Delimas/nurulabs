"use client";

import { useMemo, useState } from "react";
import { VISITS_CSV } from "@/lib/curriculum/data/clinics";

interface Row { key: string; clinic: string; sex: string; diagnosis: string; age: number; temp: number; weight: number }

const RAW: Row[] = VISITS_CSV.trim().split("\n").slice(1).map((line) => {
  const [id, clinic, date, patient, age, sex, diagnosis, temp, weight] = line.split(",");
  return { key: [id, clinic, date, patient, age, sex, diagnosis, temp, weight].join("|"), clinic, sex, diagnosis, age: +age, temp: temp === "" ? NaN : +temp, weight: +weight };
});

const STEPS = [
  { id: "dupes", label: "Drop double-submitted rows" },
  { id: "labels", label: "Standardise labels (trim, one spelling)" },
  { id: "codes", label: "Treat age 999 and −1 as missing" },
  { id: "units", label: "Fix unit slips (370 → 37.0 °C, grams → kg)" },
] as const;

type StepId = (typeof STEPS)[number]["id"];

function mean(xs: number[]) {
  const ok = xs.filter((x) => !Number.isNaN(x));
  return ok.reduce((s, x) => s + x, 0) / ok.length;
}

/** Switch cleaning rules on and off and watch the headline numbers move. */
export default function CleaningSteps({ onInteract }: { onInteract: () => void }) {
  const [on, setOn] = useState<Set<StepId>>(new Set());

  const stats = useMemo(() => {
    let rows = RAW;
    if (on.has("dupes")) {
      const seen = new Set<string>();
      rows = rows.filter((r) => (seen.has(r.key) ? false : (seen.add(r.key), true)));
    }
    rows = rows.map((r) => {
      const x = { ...r };
      if (on.has("labels")) {
        x.clinic = x.clinic.trim().toUpperCase();
        x.sex = x.sex.trim()[0].toUpperCase();
        const d = x.diagnosis.trim().toLowerCase();
        x.diagnosis = d === "diarrhea" ? "Diarrhoea" : d[0].toUpperCase() + d.slice(1);
      }
      if (on.has("codes") && (x.age < 0 || x.age > 110)) x.age = NaN;
      if (on.has("units")) {
        if (x.temp >= 45) x.temp = x.temp / 10;
        if (x.weight >= 300) x.weight = x.weight / 1000;
      }
      return x;
    });
    return {
      rows: rows.length,
      diagnoses: new Set(rows.map((r) => r.diagnosis)).size,
      sexes: new Set(rows.map((r) => r.sex)).size,
      malaria: rows.filter((r) => r.diagnosis === "Malaria").length,
      age: mean(rows.map((r) => r.age)),
      temp: mean(rows.map((r) => r.temp)),
    };
  }, [on]);

  const toggle = (id: StepId) => {
    const next = new Set(on);
    if (next.has(id)) next.delete(id); else next.add(id);
    setOn(next);
    onInteract();
  };

  const tile = (label: string, value: string, warn: boolean) => (
    <div className={`rounded-2xl p-4 ${warn ? "bg-danger-soft" : "bg-paper ring-1 ring-ink/10"}`}>
      <p className="text-xs text-ink/50">{label}</p>
      <p className="font-mono text-xl text-ink">{value}</p>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="space-y-3">
        <p className="text-sm text-ink/60">1,436 raw rows from 18 clinics. Apply the rules one at a time:</p>
        {STEPS.map((s) => (
          <label key={s.id} className="flex cursor-pointer items-center gap-3 rounded-xl bg-paper px-4 py-3 text-sm text-ink ring-1 ring-ink/10">
            <input type="checkbox" checked={on.has(s.id)} onChange={() => toggle(s.id)} className="h-4 w-4 accent-[var(--color-lime-deep)]" />
            {s.label}
          </label>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 self-start">
        {tile("rows", stats.rows.toLocaleString(), stats.rows !== 1400)}
        {tile("\"Malaria\" visits counted", String(stats.malaria), stats.diagnoses > 5)}
        {tile("different diagnosis labels", String(stats.diagnoses), stats.diagnoses > 5)}
        {tile("different sex labels", String(stats.sexes), stats.sexes > 2)}
        {tile("mean age (years)", stats.age.toFixed(1), stats.age > 30)}
        {tile("mean temperature (°C)", stats.temp.toFixed(1), stats.temp > 40)}
        <p className="col-span-2 text-xs leading-relaxed text-ink/55">
          Red tiles are still wrong. A handful of typos drags the average temperature to a deadly 45 °C, and &ldquo;999 = unknown&rdquo; nearly doubles the average age.
        </p>
      </div>
    </div>
  );
}
