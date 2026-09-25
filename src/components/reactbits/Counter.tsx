"use client";

// Adapted from React Bits "Counter" (https://reactbits.dev) —
// Copyright (c) 2026 David Haz, MIT + Commons Clause, see ./LICENSE.md.
// Changes: framer-motion import, hooks no longer called after an early
// return, digit height follows the font size (em) instead of a pixel prop,
// thousands separators, and an accessible text value.

import { useEffect } from "react";
import { motion, useSpring, useTransform, type MotionValue } from "framer-motion";

function RollingDigit({ mv, digit }: { mv: MotionValue<number>; digit: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10;
    const offset = (10 + digit - placeValue) % 10;
    let memo = offset;
    if (offset > 5) memo -= 10;
    return `${memo}em`;
  });
  return (
    <motion.span className="absolute inset-0 flex items-center justify-center" style={{ y }}>
      {digit}
    </motion.span>
  );
}

function DigitColumn({ place, value }: { place: number; value: number }) {
  const target = Math.floor(value / place);
  const animated = useSpring(target, { stiffness: 120, damping: 20 });
  useEffect(() => {
    animated.set(target);
  }, [animated, target]);

  return (
    <span className="relative inline-block overflow-hidden tabular-nums">
      {/* In-flow placeholder: gives the column its width and a real text
          baseline, so the digits line up with the words around them. */}
      <span className="invisible">0</span>
      {Array.from({ length: 10 }, (_, i) => (
        <RollingDigit key={i} mv={animated} digit={i} />
      ))}
    </span>
  );
}

/**
 * Odometer-style number whose digits roll to each new value, like the
 * total on a cash-register display. Integers only; pass `decimals` to
 * roll a scaled value (e.g. 2.3 with decimals=1).
 */
export function Counter({
  value,
  decimals = 0,
  className = "",
}: {
  value: number;
  decimals?: number;
  className?: string;
}) {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0;
  const scaled = Math.round(safe * 10 ** decimals);
  const digitCount = Math.max(String(scaled).length, decimals + 1);
  const places = Array.from({ length: digitCount }, (_, i) => 10 ** (digitCount - 1 - i));
  const label = safe.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`inline-flex items-baseline leading-none ${className}`}>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="inline-flex" style={{ lineHeight: 1 }}>
        {places.map((place, index) => {
          const fromRight = digitCount - index;
          const isDecimalBoundary = decimals > 0 && fromRight === decimals;
          const isThousands = fromRight > decimals && (fromRight - decimals) % 3 === 0 && index > 0;
          return (
            <span key={place} className="inline-flex">
              {isThousands && <span>,</span>}
              {isDecimalBoundary && <span>.</span>}
              <DigitColumn place={place} value={scaled} />
            </span>
          );
        })}
      </span>
    </span>
  );
}
