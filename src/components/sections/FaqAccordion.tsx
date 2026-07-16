"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type FaqItem = { question: string; answer: string };

export function FaqAccordion({
  title,
  items,
}: {
  title: string;
  items: FaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>

      <dl className="mt-8 space-y-3">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={item.question}
              className={`rounded-card border bg-surface-1 transition-colors ${
                isOpen ? "border-primary-400/40" : "border-border"
              }`}
            >
              <dt>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                      isOpen ? "bg-[image:var(--gradient-primary)] text-text-1" : "bg-surface-2 text-text-2"
                    }`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 10 10"
                      aria-hidden="true"
                      className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    >
                      <path
                        d="M1 3l4 4 4-4"
                        stroke="currentColor"
                        fill="none"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </span>
                </button>
              </dt>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.dd
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden text-text-2"
                  >
                    <p className="px-5 pb-4">{item.answer}</p>
                  </motion.dd>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
