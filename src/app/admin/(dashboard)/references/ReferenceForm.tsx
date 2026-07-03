"use client";

import { useActionState } from "react";

export type ReferenceFormValues = {
  businessType: string;
  translations: Record<
    "th" | "en" | "zh",
    { business: string; problem: string; install: string; result: string }
  >;
};

const emptyValues: ReferenceFormValues = {
  businessType: "restaurant",
  translations: {
    th: { business: "", problem: "", install: "", result: "" },
    en: { business: "", problem: "", install: "", result: "" },
    zh: { business: "", problem: "", install: "", result: "" },
  },
};

const businessTypes = [
  "restaurant",
  "retail",
  "buffet",
  "convenience",
  "themepark",
  "hotel",
  "cafeteria",
  "bakery",
  "manufacturing",
];

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

export function ReferenceForm({
  action,
  initialValues = emptyValues,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: ReferenceFormValues;
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <label className="block">
        <span className={labelClass}>Business Type</span>
        <select
          name="businessType"
          defaultValue={initialValues.businessType}
          className={inputClass}
        >
          {businessTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>

      {(["th", "en", "zh"] as const).map((locale) => (
        <section key={locale} className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold uppercase text-text-2">{locale}</h3>
          <div className="mt-3 space-y-4">
            <label className="block">
              <span className={labelClass}>Business Name</span>
              <input
                name={`business_${locale}`}
                defaultValue={initialValues.translations[locale].business}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Problem / Challenge</span>
              <textarea
                name={`problem_${locale}`}
                defaultValue={initialValues.translations[locale].problem}
                rows={2}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Installation</span>
              <textarea
                name={`install_${locale}`}
                defaultValue={initialValues.translations[locale].install}
                rows={2}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className={labelClass}>Result</span>
              <textarea
                name={`result_${locale}`}
                defaultValue={initialValues.translations[locale].result}
                rows={2}
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
        className="rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-text-1 shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
