"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import { SeoHint } from "../SeoHint";

export type CategoryFormValues = {
  slug: string;
  section: "hardware" | "software";
  translations: Record<"th" | "en" | "zh", { name: string }>;
};

const emptyValues: CategoryFormValues = {
  slug: "",
  section: "hardware",
  translations: { th: { name: "" }, en: { name: "" }, zh: { name: "" } },
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

export function CategoryForm({
  action,
  initialValues = emptyValues,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: CategoryFormValues;
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="max-w-xl space-y-6">
      <label className="block">
        <span className={labelClass}>Slug (URL, unique)</span>
        <input name="slug" required defaultValue={initialValues.slug} className={inputClass} />
        <SeoHint type="slug" />
      </label>

      <label className="block">
        <span className={labelClass}>Section</span>
        <select name="section" defaultValue={initialValues.section} className={inputClass}>
          <option value="hardware">Hardware</option>
          <option value="software">Software</option>
        </select>
      </label>

      {(["th", "en", "zh"] as const).map((locale) => (
        <label key={locale} className="block">
          <span className={labelClass}>Name ({locale})</span>
          <input
            name={`name_${locale}`}
            required={locale === "th"}
            defaultValue={initialValues.translations[locale].name}
            className={inputClass}
          />
        </label>
      ))}

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
