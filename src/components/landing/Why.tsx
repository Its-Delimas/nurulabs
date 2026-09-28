"use client";

import { motion } from "framer-motion";
import { Gift, Laptop, MapPinned, Wrench } from "lucide-react";

const REASONS = [
  { icon: Gift, title: "Free, all of it", body: "Every track, lab, placement check and project. No trials, no paywalled \"premium\" lessons.", tint: "bg-lime-soft text-lime-deep" },
  { icon: Laptop, title: "Any laptop will do", body: "Python runs inside the page on your own device — nothing to install, no powerful machine needed.", tint: "bg-sky/15 text-sky" },
  { icon: MapPinned, title: "African data", body: "Farm yields, clinic records, maize prices, mobile money, Swahili reviews and real World Bank data.", tint: "bg-sun/15 text-sun" },
  { icon: Wrench, title: "The tools of the job", body: "Excel, SQL, Git, Colab, Hugging Face and PyTorch — taught for real, alongside the ideas behind them.", tint: "bg-danger-soft text-danger" },
];

/** Four reasons, as cards — the "why us" at a glance. */
export default function Why() {
  return (
    <section id="why" className="scroll-mt-20 bg-cream px-6 py-24 md:px-10 xl:px-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow text-lime-deep">Why Nurulabs</p>
        <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">Talent is everywhere. Now the training is too.</h2>
        <p className="mt-4 text-ink/60">Built for students who learn on a shared laptop, between classes, on mobile data — and who want skills employers recognise.</p>
      </div>
      <div className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {REASONS.map((r, i) => (
          <motion.article
            key={r.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08 }}
            className="rounded-[28px] bg-paper p-8 text-center shadow-[0_18px_40px_-28px_rgba(0,0,0,0.35)] ring-1 ring-ink/5"
          >
            <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${r.tint}`}>
              <r.icon size={28} />
            </span>
            <h3 className="mt-6 font-display text-lg font-semibold text-ink">{r.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/55">{r.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
