"use client";

// Adapted from React Bits "TiltedCard" (https://reactbits.dev) —
// Copyright (c) 2026 David Haz, MIT + Commons Clause, see ./LICENSE.md.
// Changes: wraps arbitrary children instead of a single <img>, drops the
// tooltip and mobile warning, and stays flat for touch or reduced motion.

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useSpring, type SpringOptions } from "framer-motion";

const spring: SpringOptions = { damping: 30, stiffness: 120, mass: 1.5 };

export function TiltedCard({
  children,
  rotateAmplitude = 8,
  scaleOnHover = 1.02,
  className = "",
}: {
  children: ReactNode;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);
  const scale = useSpring(1, spring);

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;
    rotateX.set((offsetY / (rect.height / 2)) * -rotateAmplitude);
    rotateY.set((offsetX / (rect.width / 2)) * rotateAmplitude);
  }

  function handleEnter(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return;
    scale.set(scaleOnHover);
  }

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  return (
    <div
      ref={ref}
      className={`[perspective:900px] ${className}`}
      onPointerMove={handleMove}
      onPointerEnter={handleEnter}
      onPointerLeave={reset}
    >
      <motion.div className="h-full w-full [transform-style:preserve-3d]" style={{ rotateX, rotateY, scale }}>
        {children}
      </motion.div>
    </div>
  );
}
