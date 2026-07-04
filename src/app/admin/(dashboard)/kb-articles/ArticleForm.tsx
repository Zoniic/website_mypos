"use client";

import { useActionState, useState } from "react";
import { ImageUploadField } from "../ImageUploadField";
import { PdfUploadField } from "../PdfUploadField";
import { CharCounter, SeoHint } from "../SeoHint";

export type ArticleFormValues = {
  slug: string;
  categoryId: number;
  productSlug: string;
  accessorySlug: string;
  videoUrl: string;
  featured: boolean;
  coverImageUrl: string | null;
  pdfUrl: string | null;
  translations: Record<"th" | "en" | "zh", { title: string; summary: string; body: string }>;
};

const emptyValues: ArticleFormValues = {
  slug: "",
  categoryId: 0,
  productSlug: "",
  accessorySlug: "",
  videoUrl: "",
  featured: false,
  coverImageUrl: null,
  pdfUrl: null,
  translations: {
    th: { title: "", summary: "", body: "" },
    en: { title: "", summary: "", body: "" },
    zh: { title: "", summary: "", body: "" },
  },
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

export function ArticleForm({
  action,
  categories,
  initialValues = emptyValues,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  categories: { id: number; section: string; slug: string; name: string }[];
  initialValues?: ArticleFormValues;
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);
  const [summaryLength, setSummaryLength] = useState(initialValues.translations.en.summary.length);

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <section className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>Slug (URL, unique)</span>
          <input name="slug" defaultValue={initialValues.slug} className={inputClass} />
          <SeoHint type="slug" />
        </label>

        <label className="block">
          <span className={labelClass}>Category</span>
          <select name="categoryId" defaultValue={initialValues.categoryId || ""} className={inputClass}>
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                [{category.section}] {category.name || category.slug}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClass}>Linked Product slug (optional)</span>
          <input
            name="productSlug"
            defaultValue={initialValues.productSlug}
            placeholder="e.g. mypos-t2"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className={labelClass}>Linked Accessory slug (optional)</span>
          <input
            name="accessorySlug"
            defaultValue={initialValues.accessorySlug}
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelClass}>Video URL (optional — YouTube or Google Drive link)</span>
          <input
            name="videoUrl"
            defaultValue={initialValues.videoUrl}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
        </label>

        <label className="flex items-center gap-2 pt-6 sm:col-span-2">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initialValues.featured}
            className="h-4 w-4"
          />
          <span className={labelClass}>
            Recommended — shown at the top of its section page
          </span>
        </label>
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Attachments</h3>
        <ImageUploadField
          name="coverImage"
          label="Cover photo (optional)"
          currentUrl={initialValues.coverImageUrl}
          ratio="16/9"
          specHint="JPG, PNG, or WebP, max 5MB."
        />
        <SeoHint type="altText" />
        <PdfUploadField
          name="pdf"
          label="Downloadable PDF (optional)"
          currentUrl={initialValues.pdfUrl}
          specHint="PDF only, max 20MB."
        />
      </section>

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
              {locale === "en" && <SeoHint type="metaTitle" />}
            </label>
            <label className="block">
              <span className={labelClass}>Summary (shown in list/search results)</span>
              <textarea
                name={`summary_${locale}`}
                defaultValue={initialValues.translations[locale].summary}
                rows={2}
                className={inputClass}
                onChange={locale === "en" ? (e) => setSummaryLength(e.target.value.length) : undefined}
              />
              {locale === "en" && (
                <div className="mt-1">
                  <CharCounter length={summaryLength} min={120} max={160} />
                </div>
              )}
              {locale === "en" && <SeoHint type="metaDescription" />}
            </label>
            <label className="block">
              <span className={labelClass}>Body</span>
              <textarea
                name={`body_${locale}`}
                defaultValue={initialValues.translations[locale].body}
                rows={10}
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
