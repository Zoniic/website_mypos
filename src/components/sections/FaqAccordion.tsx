"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type FaqItem = { question: string; answer: string };

export function FaqAccordion({
  id,
  title,
  items,
}: {
  id?: string;
  title: string;
  items: FaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:col-span-4">
          {title}
        </h2>

        <dl className="border-t border-border-strong lg:col-span-8">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            const answerId = `${baseId}-answer-${index}`;
            return (
              <div key={item.question} className="border-b border-border-strong">
                <dt>
                  <button
                    type="button"
                    className="flex w-full cursor-pointer items-start justify-between gap-6 py-5 text-left outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                  >
                    <span className="font-display text-lg font-semibold leading-snug">{item.question}</span>
                    <span aria-hidden className="relative mt-1.5 h-3.5 w-3.5 shrink-0 text-primary-600">
                      <span className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-current" />
                      <span
                        className={`absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-current transition-transform duration-300 ${
                          isOpen ? "scale-y-0" : ""
                        }`}
                      />
                    </span>
                  </button>
                </dt>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.dd
                      id={answerId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-prose pb-6 leading-relaxed text-text-2">{item.answer}</p>
                    </motion.dd>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
