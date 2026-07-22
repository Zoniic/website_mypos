"use client";

import { useActionState } from "react";
import { SeoHint } from "../SeoHint";

export type JobPostingFormValues = {
  slug: string;
  department: string;
  location: string;
  employmentType: string;
  isOpen: boolean;
  translations: Record<"th" | "en" | "zh", { title: string; description: string }>;
};

const emptyValues: JobPostingFormValues = {
  slug: "",
  department: "",
  location: "",
  employmentType: "full-time",
  isOpen: true,
  translations: {
    th: { title: "", description: "" },
    en: { title: "", description: "" },
    zh: { title: "", description: "" },
  },
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

export function JobPostingForm({
  action,
  initialValues = emptyValues,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: JobPostingFormValues;
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Slug (URL, unique)</span>
          <input name="slug" defaultValue={initialValues.slug} className={inputClass} />
          <SeoHint type="slug" />
        </label>
        <label className="block">
          <span className={labelClass}>Department</span>
          <input name="department" defaultValue={initialValues.department} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Location</span>
          <input name="location" defaultValue={initialValues.location} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Employment Type</span>
          <select name="employmentType" defaultValue={initialValues.employmentType} className={inputClass}>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
          </select>
        </label>
        <label className="flex items-center gap-2 pt-6">
          <input type="checkbox" name="isOpen" defaultChecked={initialValues.isOpen} className="h-4 w-4 rounded outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400" />
          <span className={labelClass}>Open (visible on the careers page)</span>
        </label>
      </div>

      {(["th", "en", "zh"] as const).map((locale) => (
        <section key={locale} className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold uppercase text-text-2">{locale}</h3>
          <div className="mt-3 space-y-4">
            <label className="block">
              <span className={labelClass}>Title</span>
              <input
                name={`title_${locale}`}
                defaultValue={initialValues.translations[locale].title}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Description</span>
              <textarea
                name={`description_${locale}`}
                defaultValue={initialValues.translations[locale].description}
                rows={8}
                className={inputClass}
              />
            </label>
          </div>
        </section>
      ))}

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
