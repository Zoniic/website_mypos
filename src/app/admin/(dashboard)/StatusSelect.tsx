"use client";

import { ChevronDown } from "lucide-react";

export function StatusSelect({
  defaultValue,
  options,
  action,
  labels,
}: {
  defaultValue: string;
  options: readonly string[];
  action: (formData: FormData) => void;
  labels?: Record<string, string>;
}) {
  return (
    <form action={action} className="relative w-full">
      <select
        name="status"
        defaultValue={defaultValue}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="w-full appearance-none rounded-lg border border-border-strong bg-surface-0 py-1.5 pl-3 pr-9 text-sm focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
    </form>
  );
}
