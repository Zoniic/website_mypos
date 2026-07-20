"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Headline text with a continuously sweeping gradient "shine".
 *
 * The real text is rendered as plain, solid-colored text — never subjected
 * to `background-clip: text` + `color: transparent`. That combination,
 * animated continuously, is known to corrupt glyph shaping for scripts with
 * combining marks (Thai vowels/tone marks) on repaint in Chromium: the base
 * headline would intermittently lose or misplace marks (e.g. "ที่" reading
 * as "ทิ"). Instead, the shine is a separate `aria-hidden` decorative copy
 * absolutely positioned on top, clipped to a mostly-transparent gradient so
 * it only paints within the ~10% band of the sweep. If *that* layer's shaping
 * ever glitches, it only reduces the shine — the real text underneath, which
 * is never touched, stays correct.
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
    <span
      className={className}
      style={{ position: "relative", display: "inline-block", color: baseColor }}
    >
      {children}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 select-none"
        style={{
          backgroundImage: `linear-gradient(${angle}deg, transparent 0%, transparent 40%, ${shineColor} 50%, transparent 60%, transparent 100%)`,
          backgroundSize: "300% 100%",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
        }}
        animate={{ backgroundPositionX: ["150%", "-150%"] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
      >
        {children}
      </motion.span>
    </span>
  );
}
