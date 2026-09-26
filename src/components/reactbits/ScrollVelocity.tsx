"use client";

// Adapted from React Bits "ScrollVelocity" (https://reactbits.dev) —
// Copyright (c) 2026 David Haz, MIT + Commons Clause, see ./LICENSE.md.
// Changes: framer-motion import, single row, reduced-motion support,
// row component hoisted out of the parent render, and the frame loop only
// runs while the row is on screen (it used to tick every frame, all page long).

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const update = () => setWidth(ref.current?.offsetWidth ?? 0);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);
  return width;
}

function wrap(min: number, max: number, v: number) {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
}

/**
 * A single row of repeated content that drifts sideways and speeds up (or
 * reverses) with the reader's scroll velocity.
 */
export function ScrollVelocity({
  children,
  baseVelocity = 40,
  copies = 4,
  className = "",
}: {
  children: ReactNode;
  /** Pixels per second when the page isn't scrolling; negative drifts right. */
  baseVelocity?: number;
  copies?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });

  const copyRef = useRef<HTMLDivElement>(null);
  const copyWidth = useElementWidth(copyRef);
  const x = useTransform(baseX, (v) => (copyWidth === 0 ? "0px" : `${wrap(-copyWidth, 0, v)}px`));

  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });

  const direction = useRef(1);
  useAnimationFrame((_, delta) => {
    if (reduceMotion || !inView) return;
    let moveBy = direction.current * baseVelocity * (delta / 1000);
    const factor = velocityFactor.get();
    if (factor < 0) direction.current = -1;
    else if (factor > 0) direction.current = 1;
    moveBy += direction.current * moveBy * factor;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div ref={rootRef} className="relative overflow-hidden">
      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {Array.from({ length: copies }, (_, i) => (
          <div
            key={i}
            ref={i === 0 ? copyRef : undefined}
            aria-hidden={i > 0 ? true : undefined}
            className={`flex shrink-0 items-center ${className}`}
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
