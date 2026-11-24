"use client";
import { useState } from "react";

const LENGTH = 6;

/**
 * Six boxes for a 6-digit code. A real transparent input sits on top, so
 * typing, pasting and the phone's one-time-code suggestion all work, and the
 * form posts a plain `code` field.
 */
export function CodeInput({
  id,
  name = "code",
  label,
  value,
  onChange,
  autoFocus = false,
}: {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const digits = value.padEnd(LENGTH, " ").split("");
  const active = Math.min(value.length, LENGTH - 1);
  return (
    <div className="relative">
      <div className="flex gap-1.5" aria-hidden="true">
        {digits.map((digit, i) => (
          <div
            key={i}
            className={`flex h-[52px] min-w-0 flex-1 items-center justify-center rounded-[10px] border bg-bg text-[22px] font-semibold text-text-1 ${
              focused && i === active ? "border-primary-400 ring-2 ring-primary-400/40" : "border-border-strong"
            }`}
          >
            {digit.trim()}
          </div>
        ))}
      </div>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, LENGTH))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={LENGTH}
        autoFocus={autoFocus}
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-text opacity-0"
      />
    </div>
  );
}
