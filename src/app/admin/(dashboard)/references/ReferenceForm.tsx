"use client";

import { BUSINESS_TYPES } from "@/data/businessTypes";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import { ImageUploadField } from "../ImageUploadField";
import { SeoHint } from "../SeoHint";

export type ReferenceFormValues = {
  slug: string;
  businessType: string;
  imageUrl: string | null;
  logoUrl: string | null;
  translations: Record<
    "th" | "en" | "zh",
    { business: string; problem: string; install: string; result: string }
  >;
};

const emptyValues: ReferenceFormValues = {
  slug: "",
  businessType: "restaurant",
  imageUrl: null,
  logoUrl: null,
  translations: {
    th: { business: "", problem: "", install: "", result: "" },
    en: { business: "", problem: "", install: "", result: "" },
    zh: { business: "", problem: "", install: "", result: "" },
  },
};


const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

export function ReferenceForm({
  action,
  initialValues = emptyValues,
  businessTypes = BUSINESS_TYPES,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: ReferenceFormValues;
  /** Every business type incl. ones added in /admin/catalog. */
  businessTypes?: readonly string[];
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="max-w-2xl space-y-8">
      <label className="block">
        <span className={labelClass}>Slug (URL, unique)</span>
        <input name="slug" required defaultValue={initialValues.slug} className={inputClass} />
        <SeoHint type="slug" />
      </label>

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

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Photos</h3>
        <ImageUploadField
          name="siteImage"
          label="On-site photo"
          currentUrl={initialValues.imageUrl}
          ratio="4/3"
          specHint="Photo of the actual installation at the customer's location. JPG, PNG, or WebP, max 5MB."
        />
        <ImageUploadField
          name="logoImage"
          label="Customer logo"
          currentUrl={initialValues.logoUrl}
          ratio="1/1"
          specHint="Customer's brand logo, ideally on a transparent or white background. Optional."
        />
      </section>

      {(["th", "en", "zh"] as const).map((locale) => (
        <section key={locale} className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold uppercase text-text-2">{locale}</h3>
          <div className="mt-3 space-y-4">
            <label className="block">
              <span className={labelClass}>Business Name</span>
              <input
                name={`business_${locale}`}
                required={locale === "th"}
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
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
