"use client";

import { useState } from "react";

const FLAT = [
  { tx: "TX01", customer: "Amina Odhiambo", phone: "0712 345678", county: "Kisumu", agent: "AG004", agent_name: "Kondele Traders", amount: 1500 },
  { tx: "TX02", customer: "Amina Odhiambo", phone: "0712 345678", county: "Kisumu", agent: "AG005", agent_name: "Ahero Agency", amount: 800 },
  { tx: "TX03", customer: "Brian Kamau", phone: "0722 111222", county: "Nairobi", agent: "AG004", agent_name: "Kondele Traders", amount: 2200 },
  { tx: "TX04", customer: "Amina Odhiambo", phone: "0712 345678", county: "Kisumu", agent: "AG004", agent_name: "Kondele Mega Agency", amount: 400 },
];

/** A flat export vs the same facts in three linked tables. */
export default function NormaliseTable({ onInteract }: { onInteract: () => void }) {
  const [split, setSplit] = useState(false);
  const cell = "px-3 py-1.5 font-mono text-xs";
  const head = "px-3 py-2 text-left font-mono text-[11px] font-semibold text-ink/45";

  return (
    <div className="space-y-5">
      <div className="inline-flex rounded-xl bg-ink/5 p-1">
        {[false, true].map((v) => (
          <button key={String(v)} type="button" onClick={() => { setSplit(v); onInteract(); }} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${split === v ? "bg-paper text-ink shadow-sm ring-1 ring-ink/10" : "text-ink/50"}`}>
            {v ? "normalised: three tables" : "flat export: one table"}
          </button>
        ))}
      </div>
      {!split ? (
        <div className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
          <table className="w-full">
            <thead><tr>{["tx", "customer", "phone", "county", "agent", "agent_name", "amount"].map((h) => <th key={h} className={head}>{h}</th>)}</tr></thead>
            <tbody>{FLAT.map((r) => (
              <tr key={r.tx} className="border-t border-ink/5">
                <td className={cell}>{r.tx}</td>
                <td className={`${cell} bg-sun/10`}>{r.customer}</td><td className={`${cell} bg-sun/10`}>{r.phone}</td><td className={`${cell} bg-sun/10`}>{r.county}</td>
                <td className={cell}>{r.agent}</td>
                <td className={`${cell} ${r.agent_name === "Kondele Mega Agency" ? "bg-danger-soft font-semibold text-danger" : "bg-sky/10"}`}>{r.agent_name}</td>
                <td className={cell}>{r.amount}</td>
              </tr>
            ))}</tbody>
          </table>
          <p className="border-t border-ink/5 px-4 py-3 text-xs text-ink/60">Shaded cells repeat the same facts: Amina&apos;s name, phone and county are stored three times, Kondele&apos;s name three times. AG004 now has two names: which is right? That&apos;s an <strong>update anomaly</strong>.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { title: "customers", cols: ["customer_id", "name", "phone", "county"], rows: [["C1", "Amina Odhiambo", "+254712345678", "Kisumu"], ["C2", "Brian Kamau", "+254722111222", "Nairobi"]] },
            { title: "agents", cols: ["agent_code", "name"], rows: [["AG004", "Kondele Mega Agency"], ["AG005", "Ahero Agency"]] },
            { title: "transactions", cols: ["tx", "customer_id", "agent_code", "amount"], rows: FLAT.map((r) => [r.tx, r.customer === "Brian Kamau" ? "C2" : "C1", r.agent, String(r.amount)]) },
          ].map((t) => (
            <div key={t.title} className="overflow-x-auto rounded-2xl bg-paper ring-1 ring-ink/10">
              <p className="px-3 pt-3 font-mono text-xs font-semibold text-ink">{t.title}</p>
              <table className="w-full"><thead><tr>{t.cols.map((h) => <th key={h} className={head}>{h}</th>)}</tr></thead>
                <tbody>{t.rows.map((r, i) => <tr key={i} className="border-t border-ink/5">{r.map((c, j) => <td key={j} className={`${cell} ${t.cols[j].endsWith("_id") || t.cols[j] === "agent_code" ? "text-lime-deep" : ""}`}>{c}</td>)}</tr>)}</tbody></table>
            </div>
          ))}
          <p className="text-xs leading-relaxed text-ink/60 lg:col-span-3">Each fact is stored once. Transactions point to customers and agents by <strong>key</strong> (green). Renaming an agent is one update in one row — the anomaly can&apos;t happen.</p>
        </div>
      )}
    </div>
  );
}
