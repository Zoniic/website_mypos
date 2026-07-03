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
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>

      <dl className="mt-8 divide-y divide-border border-y border-border">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.question}>
              <dt>
                <button
                  type="button"
                  className="flex w-full items-center justify-between py-4 text-left font-medium"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 10 10"
                    aria-hidden="true"
                    className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    <path
                      d="M1 3l4 4 4-4"
                      stroke="currentColor"
                      fill="none"
                      strokeWidth="1.5"
                    />
                  </svg>
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
                    <p className="pb-4">{item.answer}</p>
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
