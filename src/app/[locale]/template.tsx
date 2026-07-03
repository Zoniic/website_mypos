"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// template.tsx (unlike layout.tsx) remounts on every navigation, which is
// what makes a route-change transition possible here.
export default function LocaleTemplate({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
