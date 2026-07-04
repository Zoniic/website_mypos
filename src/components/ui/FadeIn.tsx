"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function FadeIn({
  children,
  delay = 0,
  y = 16,
  x = 0,
  scale,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, x, ...(scale !== undefined ? { scale } : {}) }}
      whileInView={{ opacity: 1, y: 0, x: 0, ...(scale !== undefined ? { scale: 1 } : {}) }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
