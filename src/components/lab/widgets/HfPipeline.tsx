"use client";

import { useRef, useState } from "react";
import { Download, Play } from "lucide-react";

const MODEL = "Xenova/distilbert-base-uncased-finetuned-sst-2-english";
const CDN = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0";
const EXAMPLES = ["The delivery was fast and the agent was very helpful!", "The app keeps crashing and nobody answers my calls.", "The seeds were not bad at all."];

type Classifier = (text: string) => Promise<{ label: string; score: number }[]>;

// Only ever called from event handlers.
const now = () => performance.now();

/**
 * A real Hugging Face model, downloaded once (~67 MB) and run in this browser
 * with transformers.js — the JavaScript twin of Python's `pipeline()`.
 */
export default function HfPipeline({ onInteract }: { onInteract: () => void }) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState(EXAMPLES[0]);
  const [result, setResult] = useState<{ label: string; score: number; ms: number } | null>(null);
  const clf = useRef<Classifier | null>(null);

  async function load() {
    setState("loading");
    onInteract();
    try {
      // Loaded from the CDN only when asked, so nobody downloads it by accident.
      const importer = new Function("u", "return import(u)") as (u: string) => Promise<{ pipeline: (...a: unknown[]) => Promise<Classifier> }>;
      const { pipeline } = await importer(CDN);
      clf.current = await pipeline("sentiment-analysis", MODEL, {
        dtype: "int8",
        progress_callback: (p: { status: string; progress?: number }) => {
          if (p.status === "progress" && p.progress !== undefined) setProgress(Math.round(p.progress));
        },
      });
      setState("ready");
      await run(text);
    } catch {
      setState("error");
    }
  }

  async function run(t: string) {
    if (!clf.current) return;
    const start = now();
    const [out] = await clf.current(t);
    setResult({ ...out, ms: Math.round(now() - start) });
    onInteract();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className="w-full rounded-2xl border border-ink/15 bg-paper p-4 text-[15px] text-ink focus:border-ink focus:outline-none" />
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button key={e} type="button" onClick={() => { setText(e); if (state === "ready") run(e); onInteract(); }} className="rounded-full px-3 py-1.5 text-xs text-ink/65 ring-1 ring-ink/15">{e.slice(0, 32)}…</button>
          ))}
        </div>
        {state === "idle" && (
          <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-paper">
            <Download size={15} /> Download the model (≈67 MB) and run it here
          </button>
        )}
        {state === "loading" && <p className="text-sm text-ink/60">Downloading model… {progress}%</p>}
        {state === "ready" && (
          <button type="button" onClick={() => run(text)} className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-semibold text-paper">
            <Play size={15} /> Classify
          </button>
        )}
        {state === "error" && <p className="text-sm text-danger">Couldn&apos;t download the model — check your connection and reload the page to try again.</p>}
        {result && (
          <div className={`rounded-2xl p-4 ${result.label === "POSITIVE" ? "bg-lime-soft ring-1 ring-lime-deep/20" : "bg-danger-soft"}`}>
            <p className="font-display text-xl font-semibold text-ink">{result.label} · {(result.score * 100).toFixed(1)}%</p>
            <p className="text-xs text-ink/55">answered in {result.ms} ms, entirely on your device</p>
          </div>
        )}
      </div>
      <div className="space-y-3">
        <pre className="overflow-x-auto rounded-2xl bg-code p-4 font-mono text-xs leading-6 text-white/90">{`# The same thing in Python
from transformers import pipeline

clf = pipeline(
    "sentiment-analysis",
    model="distilbert/distilbert-base-uncased-finetuned-sst-2-english",
)
clf("${text.replace(/"/g, "'").slice(0, 40)}${text.length > 40 ? "…" : ""}")`}</pre>
        <p className="text-xs leading-relaxed text-ink/55">
          A real model from the Hugging Face Hub (DistilBERT fine-tuned on English movie reviews, Apache-2.0), in an 8-bit web version. The download happens once, only if you press the button — skip it on limited data; the lab doesn&apos;t need it. Try the Swahili and Sheng you know: an English-only model will guess badly, which is exactly why choosing the right model matters.
        </p>
      </div>
    </div>
  );
}
