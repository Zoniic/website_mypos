"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Scroll reveal that only moves content, never hides it: the element is
 * fully visible in the server HTML and simply settles into place when it
 * scrolls into view. Gating on opacity:0 left sections blank for crawlers,
 * screenshots, and slow JS.
 */
export function FadeIn({
  children,
  delay = 0,
  y = 14,
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
      initial={{ y, x, ...(scale !== undefined ? { scale } : {}) }}
      whileInView={{ y: 0, x: 0, ...(scale !== undefined ? { scale: 1 } : {}) }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: [0.25, 1, 0.5, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
