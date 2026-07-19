"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Headline text with a continuously sweeping gradient "shine" — the base
 * color reads normally, the shine color sweeps across on a loop. Not used
 * on interactive controls (buttons/links), only decorative headline text,
 * so it doesn't conflict with the one-color-on-primary-CTA rule.
 */
export function ShinyText({
  children,
  // Ink base with a silver sweep — the shimmer reads on the light theme's
  // white background, where the old pale-blue base washed out entirely.
  baseColor = "#111318",
  shineColor = "#b7bec8",
  speed = 3,
  angle = 100,
  className,
}: {
  children: ReactNode;
  baseColor?: string;
  shineColor?: string;
  /** Full loop duration in seconds. */
  speed?: number;
  /** Gradient sweep angle in degrees. */
  angle?: number;
  className?: string;
}) {
  return (
    <motion.span
      className={className}
      style={{
        backgroundImage: `linear-gradient(${angle}deg, ${baseColor} 0%, ${baseColor} 40%, ${shineColor} 50%, ${baseColor} 60%, ${baseColor} 100%)`,
        backgroundSize: "300% 100%",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
        display: "inline-block",
      }}
      animate={{ backgroundPositionX: ["150%", "-150%"] }}
      transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  );
}
