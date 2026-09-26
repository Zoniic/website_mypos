"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

// template.tsx (unlike layout.tsx) remounts on every navigation, which is
// what makes a route-change transition possible here. Transform only: an
// opacity fade would ship the server-rendered page invisible until
// JavaScript runs, delaying Largest Contentful Paint by seconds on mobile.
export default function LocaleTemplate({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { y: 8 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
    >
      {children}
    </motion.div>
  );
}
