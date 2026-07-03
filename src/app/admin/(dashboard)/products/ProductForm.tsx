"use client";

import { useActionState } from "react";
import { ImageUploadField } from "../ImageUploadField";

export type ProductFormValues = {
  slug: string;
  priceFrom: number;
  category: string;
  os: string;
  screenSize: string;
  cpu: string;
  ram: string;
  storage: string;
  connectivity: string;
  dimensions: string;
  weight: string;
  warrantyMonths: number;
  datasheetUrl: string;
  featured: boolean;
  businessTypes: string;
  relatedSlugs: string;
  imageUrl: string | null;
  galleryUrls: string[];
  translations: Record<"th" | "en" | "zh", { name: string; highlight: string }>;
};

const emptyValues: ProductFormValues = {
  slug: "",
  priceFrom: 0,
  category: "pos",
  os: "Android",
  screenSize: "",
  cpu: "",
  ram: "",
  storage: "",
  connectivity: "",
  dimensions: "",
  weight: "",
  warrantyMonths: 12,
  datasheetUrl: "",
  featured: false,
  businessTypes: "",
  relatedSlugs: "",
  imageUrl: null,
  galleryUrls: [],
  translations: {
    th: { name: "", highlight: "" },
    en: { name: "", highlight: "" },
    zh: { name: "", highlight: "" },
  },
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

function Field({
  label,
  name,
  defaultValue,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  type?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className={inputClass} />
    </label>
  );
}

export function ProductForm({
  action,
  initialValues = emptyValues,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: ProductFormValues;
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <section className="grid gap-4 sm:grid-cols-2">
        <Field label="Slug (URL, unique)" name="slug" defaultValue={initialValues.slug} />
        <Field
          label="Price From (THB)"
          name="priceFrom"
          type="number"
          defaultValue={initialValues.priceFrom}
        />

        <label className="block">
          <span className={labelClass}>Category</span>
          <select
            name="category"
            defaultValue={initialValues.category}
            className={inputClass}
          >
            <option value="self-order">self-order</option>
            <option value="weigh-pay">weigh-pay</option>
            <option value="pos">pos</option>
            <option value="ticketing">ticketing</option>
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>OS</span>
          <select name="os" defaultValue={initialValues.os} className={inputClass}>
            <option value="Android">Android</option>
            <option value="Windows">Windows</option>
          </select>
        </label>

        <Field label="Screen Size" name="screenSize" defaultValue={initialValues.screenSize} />
        <Field label="CPU" name="cpu" defaultValue={initialValues.cpu} />
        <Field label="RAM" name="ram" defaultValue={initialValues.ram} />
        <Field label="Storage" name="storage" defaultValue={initialValues.storage} />
        <Field
          label="Connectivity (comma-separated)"
          name="connectivity"
          defaultValue={initialValues.connectivity}
        />
        <Field label="Dimensions" name="dimensions" defaultValue={initialValues.dimensions} />
        <Field label="Weight" name="weight" defaultValue={initialValues.weight} />
        <Field
          label="Warranty (months)"
          name="warrantyMonths"
          type="number"
          defaultValue={initialValues.warrantyMonths}
        />
        <Field
          label="Datasheet URL (optional)"
          name="datasheetUrl"
          defaultValue={initialValues.datasheetUrl}
        />
        <Field
          label="Business Types (comma-separated)"
          name="businessTypes"
          defaultValue={initialValues.businessTypes}
        />
        <Field
          label="Related Product Slugs (comma-separated)"
          name="relatedSlugs"
          defaultValue={initialValues.relatedSlugs}
        />

        <label className="flex items-center gap-2 pt-6">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initialValues.featured}
            className="h-4 w-4"
          />
          <span className={labelClass}>Featured on homepage</span>
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Photos</h3>
        <ImageUploadField
          name="mainImage"
          label="Main photo"
          currentUrl={initialValues.imageUrl}
          ratio="1/1"
          specHint="Square, at least 1000×1000px, plain/white background preferred. JPG, PNG, or WebP, max 5MB."
        />
        <ImageUploadField
          name="galleryImage1"
          label="Gallery photo — side view"
          currentUrl={initialValues.galleryUrls[0]}
          ratio="1/1"
          specHint="Same spec as main photo. Optional."
        />
        <ImageUploadField
          name="galleryImage2"
          label="Gallery photo — back view"
          currentUrl={initialValues.galleryUrls[1]}
          ratio="1/1"
          specHint="Same spec as main photo. Optional."
        />
        <ImageUploadField
          name="galleryImage3"
          label="Gallery photo — in use"
          currentUrl={initialValues.galleryUrls[2]}
          ratio="1/1"
          specHint="Same spec as main photo. Optional."
        />
      </section>

      {(["th", "en", "zh"] as const).map((locale) => (
        <section key={locale} className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold uppercase text-text-2">{locale}</h3>
          <div className="mt-3 space-y-4">
            <Field
              label="Name"
              name={`name_${locale}`}
              defaultValue={initialValues.translations[locale].name}
            />
            <label className="block">
              <span className={labelClass}>Highlight (1-2 sentence description)</span>
              <textarea
                name={`highlight_${locale}`}
                defaultValue={initialValues.translations[locale].highlight}
                rows={3}
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
