"use client";

import { useActionState } from "react";
import { ImageUploadField } from "../ImageUploadField";
import { SeoHint } from "../SeoHint";
import { CategoryCheckboxes } from "../CategoryCheckboxes";

export type AccessoryFormValues = {
  slug: string;
  categories: string[];
  imageUrl: string | null;
  translations: Record<"th" | "en" | "zh", { name: string; description: string }>;
};

const emptyValues: AccessoryFormValues = {
  slug: "",
  categories: [],
  imageUrl: null,
  translations: {
    th: { name: "", description: "" },
    en: { name: "", description: "" },
    zh: { name: "", description: "" },
  },
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

export function AccessoryForm({
  action,
  initialValues = emptyValues,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: AccessoryFormValues;
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      <label className="block">
        <span className={labelClass}>Slug (unique identifier)</span>
        <input name="slug" defaultValue={initialValues.slug} className={inputClass} />
        <SeoHint type="slug" />
      </label>

      <CategoryCheckboxes
        name="categories"
        label="Applies to categories (which POS types this accessory suits)"
        defaultValue={initialValues.categories}
      />

      <ImageUploadField
        name="image"
        label="Photo"
        currentUrl={initialValues.imageUrl}
        ratio="1/1"
        specHint="Square, at least 800×800px, plain/white background preferred. JPG, PNG, or WebP, max 5MB."
      />
      <SeoHint type="altText" />

      {(["th", "en", "zh"] as const).map((locale) => (
        <section key={locale} className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold uppercase text-text-2">{locale}</h3>
          <div className="mt-3 space-y-4">
            <label className="block">
              <span className={labelClass}>Name</span>
              <input
                name={`name_${locale}`}
                defaultValue={initialValues.translations[locale].name}
                className={inputClass}
              />
              {locale === "en" && <SeoHint type="name" />}
            </label>
            <label className="block">
              <span className={labelClass}>Description</span>
              <textarea
                name={`description_${locale}`}
                defaultValue={initialValues.translations[locale].description}
                rows={3}
                className={inputClass}
              />
              {locale === "en" && <SeoHint type="description" />}
            </label>
          </div>
        </section>
      ))}

      {error && <p className="text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
