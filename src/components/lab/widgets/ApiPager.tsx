"use client";

import { useEffect, useRef, useState } from "react";

const PAGES = [100, 100, 100, 100, 100, 100, 20];
const FLAKY_PAGES = new Set([3, 6]);
type Policy = "none" | "immediate" | "backoff";
type PageState = "idle" | "ok" | "failed";

const POLICIES: Record<Policy, string> = {
  none: "no retries",
  immediate: "retry at once ×3",
  backoff: "backoff 1 s, 2 s, 4 s",
};

/**
 * Page through a paginated API. On a flaky network a struggling server needs
 * a moment to recover: retrying at once fails again, waiting succeeds.
 */
export default function ApiPager({ onInteract }: { onInteract: () => void }) {
  const [flaky, setFlaky] = useState(false);
  const [policy, setPolicy] = useState<Policy>("none");
  const [pages, setPages] = useState<PageState[]>(PAGES.map(() => "idle"));
  const [log, setLog] = useState<string[]>([]);
  const [requests, setRequests] = useState(0);
  const [waited, setWaited] = useState(0);
  const logRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [log]);

  const next = pages.findIndex((p) => p !== "ok");
  const stopped = pages.includes("failed");
  const done = next === -1;
  const records = pages.reduce((s, p, i) => s + (p === "ok" ? PAGES[i] : 0), 0);

  function reset(nextFlaky = flaky, nextPolicy = policy) {
    setFlaky(nextFlaky);
    setPolicy(nextPolicy);
    setPages(PAGES.map(() => "idle"));
    setLog([]);
    setRequests(0);
    setWaited(0);
    onInteract();
  }

  /** Fetch one page with the chosen policy; returns whether it succeeded. */
  function fetchPage(i: number, state: { pages: PageState[]; log: string[]; requests: number; waited: number }) {
    const page = i + 1;
    const struggling = flaky && FLAKY_PAGES.has(page);
    const attempts = policy === "none" ? 1 : 4;
    let sinceFailure = 0;
    for (let a = 1; a <= attempts; a++) {
      state.requests++;
      // A struggling server recovers after a second's pause.
      const fails = struggling && (a === 1 || sinceFailure < 1);
      if (!fails) {
        state.log.push(`GET /prices?page=${page} → 200 · ${PAGES[i]} records`);
        state.pages[i] = "ok";
        return true;
      }
      state.log.push(`GET /prices?page=${page} → 503 service unavailable`);
      if (a < attempts) {
        const wait = policy === "backoff" ? 2 ** (a - 1) : 0;
        sinceFailure = wait;
        state.waited += wait;
        if (wait) state.log.push(`  wait ${wait} s…`);
      }
    }
    state.log.push(`✗ gave up on page ${page}: the extract stops with partial data`);
    state.pages[i] = "failed";
    return false;
  }

  function run(all: boolean) {
    if (done || stopped) return;
    const state = { pages: [...pages], log: [...log], requests, waited };
    let i = next;
    while (i < PAGES.length && fetchPage(i, state) && all) i++;
    if (state.pages.every((p) => p === "ok")) state.log.push(`✓ next_page is null: done, ${PAGES.reduce((a, b) => a + b)} records`);
    setPages(state.pages);
    setLog(state.log);
    setRequests(state.requests);
    setWaited(state.waited);
    onInteract();
  }

  const button = "rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition-colors disabled:opacity-40";

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-ink/5 p-1">
            {[false, true].map((v) => (
              <button key={String(v)} type="button" onClick={() => reset(v, policy)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${flaky === v ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
                {v ? "flaky network" : "good network"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(POLICIES) as Policy[]).map((p) => (
            <button key={p} type="button" onClick={() => reset(flaky, p)} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 ${policy === p ? "bg-ink text-paper ring-ink" : "text-ink/60 ring-ink/15"}`}>
              {POLICIES[p]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {pages.map((p, i) => (
            <div key={i} className={`rounded-xl px-1 py-3 text-center ring-1 ${p === "ok" ? "bg-lime-soft ring-lime-deep/30" : p === "failed" ? "bg-danger-soft ring-danger/30" : i === next ? "bg-paper ring-ink/30" : "bg-paper ring-ink/10"}`}>
              <p className="font-mono text-[11px] text-ink/45">page</p>
              <p className="font-display text-lg font-semibold text-ink">{i + 1}</p>
              <p className="font-mono text-[10px] text-ink/45">{PAGES[i]}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={done || stopped} onClick={() => run(false)} className={`${button} bg-paper text-ink ring-ink/15`}>Fetch next page</button>
          <button type="button" disabled={done || stopped} onClick={() => run(true)} className={`${button} bg-ink text-paper ring-ink`}>Fetch to the end</button>
          <button type="button" onClick={() => reset()} className={`${button} text-ink/60 ring-ink/10`}>Reset</button>
        </div>

        <dl className="grid grid-cols-3 gap-3">
          {[
            ["records", records.toLocaleString()],
            ["requests", String(requests)],
            ["waited", `${waited} s`],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-paper p-3 ring-1 ring-ink/10">
              <dt className="text-xs text-ink/50">{k}</dt>
              <dd className="font-display text-xl font-semibold text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="space-y-3">
        <pre ref={logRef} className="h-72 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-code p-4 font-mono text-xs leading-relaxed text-white/80">
          {log.length ? log.join("\n") : "# requests will appear here"}
        </pre>
        <p className="text-xs leading-relaxed text-ink/55">
          620 records, 100 per page. On the flaky network, pages 3 and 6 hit a struggling server that needs about a second to recover. The records are simulated, and so is the waiting.
        </p>
      </div>
    </div>
  );
}
