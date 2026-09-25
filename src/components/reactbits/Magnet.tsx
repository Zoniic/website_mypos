"use client";

// Adapted from React Bits "Magnet" (https://reactbits.dev) —
// Copyright (c) 2026 David Haz, MIT + Commons Clause, see ./LICENSE.md.
// Changes: motion values instead of React state per mousemove, fine-pointer
// and reduced-motion only, gentler default pull.

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";

export function Magnet({
  children,
  padding = 60,
  strength = 6,
  className = "",
}: {
  children: ReactNode;
  /** How far outside the element (px) the pull starts. */
  padding?: number;
  /** Higher = weaker pull. */
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const x = useSpring(0, { stiffness: 200, damping: 18 });
  const y = useSpring(0, { stiffness: 200, damping: 18 });

  useEffect(() => {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    function handleMove(event: PointerEvent) {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const inside =
        Math.abs(event.clientX - cx) < rect.width / 2 + padding &&
        Math.abs(event.clientY - cy) < rect.height / 2 + padding;
      x.set(inside ? (event.clientX - cx) / strength : 0);
      y.set(inside ? (event.clientY - cy) / strength : 0);
    }
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [padding, strength, reduceMotion, x, y]);

  return (
    <motion.div ref={ref} className={`inline-block ${className}`} style={{ x, y }}>
      {children}
    </motion.div>
  );
}
