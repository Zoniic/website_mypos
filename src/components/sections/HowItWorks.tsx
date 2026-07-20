"use client";

import { motion } from "framer-motion";

export type StepItem = { title: string; description: string };

export function HowItWorks({
  id,
  title,
  steps,
}: {
  id?: string;
  title: string;
  steps: StepItem[];
}) {
  return (
    <section id={id} className="scroll-mt-28 border-y border-border bg-surface-0 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>

        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
              className="h-full rounded-2xl bg-surface-1 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-sm font-bold text-white shadow-[var(--shadow-glow-primary)]">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-text-2">{step.description}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
