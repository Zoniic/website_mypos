"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import { ImageUploadField } from "../ImageUploadField";
import { SeoHint } from "../SeoHint";
import { CategoryCheckboxes } from "../CategoryCheckboxes";

export type AccessoryFormValues = {
  slug: string;
  categories: string[];
  imageUrl: string | null;
  onlinePrice: number | null;
  shopeeUrl: string;
  lazadaUrl: string;
  translations: Record<"th" | "en" | "zh", { name: string; description: string }>;
};

const emptyValues: AccessoryFormValues = {
  slug: "",
  categories: [],
  imageUrl: null,
  onlinePrice: null,
  shopeeUrl: "",
  lazadaUrl: "",
  translations: {
    th: { name: "", description: "" },
    en: { name: "", description: "" },
    zh: { name: "", description: "" },
  },
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

export function AccessoryForm({
  action,
  initialValues = emptyValues,
  categoryOptions,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: AccessoryFormValues;
  categoryOptions?: string[];
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="max-w-2xl space-y-8">
      <label className="block">
        <span className={labelClass}>Slug (unique identifier)</span>
        <input name="slug" required defaultValue={initialValues.slug} className={inputClass} />
        <SeoHint type="slug" />
      </label>

      <CategoryCheckboxes
        name="categories"
        label="Applies to categories (which POS types this accessory suits)"
        options={categoryOptions}
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

      <section className="space-y-3 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Online sales</h3>
        <p className="text-xs text-text-2">
          Consumables and add-ons (paper rolls, printers, cash drawers) sell best online. With a price set, the
          accessories page shows it with &quot;Add to cart&quot; when online ordering is on.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className={labelClass}>Online price (THB, incl. VAT)</span>
            <input name="onlinePrice" type="number" min={1} defaultValue={initialValues.onlinePrice ?? undefined} className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Shopee listing URL</span>
            <input name="shopeeUrl" defaultValue={initialValues.shopeeUrl} className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Lazada listing URL</span>
            <input name="lazadaUrl" defaultValue={initialValues.lazadaUrl} className={inputClass} />
          </label>
        </div>
      </section>

      {(["th", "en", "zh"] as const).map((locale) => (
        <section key={locale} className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold uppercase text-text-2">{locale}</h3>
          <div className="mt-3 space-y-4">
            <label className="block">
              <span className={labelClass}>Name</span>
              <input
                name={`name_${locale}`}
                required={locale === "th"}
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
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
