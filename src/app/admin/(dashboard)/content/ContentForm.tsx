"use client";

import { useActionState } from "react";
import { updateContent } from "./actions";

export function ContentForm({
  namespace,
  keys,
  values,
}: {
  namespace: string;
  keys: string[];
  values: Record<string, string>;
}) {
  const boundAction = updateContent.bind(null, namespace);
  const [status, formAction, isPending] = useActionState(boundAction, null);
  const isError = status !== null && status !== "saved";

  return (
    <form action={formAction} className="mt-6 max-w-4xl space-y-6">
      {keys.map((key) => (
        <fieldset key={key} className="rounded-xl border border-border p-4">
          <legend className="px-1 font-mono text-sm text-text-2">{key}</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {(["th", "en", "zh"] as const).map((locale) => {
              const value = values[`${key}__${locale}`] ?? "";
              const isLong = value.length > 80 || value.trim().startsWith("[");
              return (
                <label key={locale} className="block">
                  <span className="text-xs font-semibold uppercase text-text-2">{locale}</span>
                  <textarea
                    name={`${key}__${locale}`}
                    defaultValue={value}
                    rows={isLong ? 6 : 2}
                    className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 font-mono text-xs text-text-1"
                  />
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {status === "saved" && <p className="text-sm text-success">Saved.</p>}
      {isError && <p className="text-sm text-error">{status}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-text-1 shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save All Changes"}
      </button>
    </form>
  );
}
