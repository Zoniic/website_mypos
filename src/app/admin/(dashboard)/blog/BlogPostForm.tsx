"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import { ImageUploadField } from "../ImageUploadField";
import { SeoHint } from "../SeoHint";

export type BlogPostFormValues = {
  slug: string;
  featured: boolean;
  coverImageUrl: string | null;
  translations: Record<"th" | "en" | "zh", { title: string; excerpt: string; body: string }>;
};

const emptyValues: BlogPostFormValues = {
  slug: "",
  featured: false,
  coverImageUrl: null,
  translations: {
    th: { title: "", excerpt: "", body: "" },
    en: { title: "", excerpt: "", body: "" },
    zh: { title: "", excerpt: "", body: "" },
  },
};

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

export function BlogPostForm({
  action,
  initialValues = emptyValues,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: BlogPostFormValues;
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

      <label className="flex items-center gap-2">
        <input type="checkbox" name="featured" defaultChecked={initialValues.featured} className="h-4 w-4 rounded outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400" />
        <span className={labelClass}>Featured</span>
      </label>

      <ImageUploadField
        name="coverImage"
        label="Cover photo"
        currentUrl={initialValues.coverImageUrl}
        ratio="16/9"
        specHint="JPG, PNG, or WebP, max 5MB."
      />
      <SeoHint type="altText" />

      {(["th", "en", "zh"] as const).map((locale) => (
        <section key={locale} className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-semibold uppercase text-text-2">{locale}</h3>
          <div className="mt-3 space-y-4">
            <label className="block">
              <span className={labelClass}>Title</span>
              <input
                name={`title_${locale}`}
                required={locale === "th"}
                defaultValue={initialValues.translations[locale].title}
                className={inputClass}
              />
              {locale === "en" && <SeoHint type="name" />}
            </label>
            <label className="block">
              <span className={labelClass}>Excerpt (shown on the blog list)</span>
              <textarea
                name={`excerpt_${locale}`}
                defaultValue={initialValues.translations[locale].excerpt}
                rows={2}
                className={inputClass}
              />
              {locale === "en" && <SeoHint type="description" />}
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
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "กำลังบันทึก..." : submitLabel}
      </button>
    </form>
  );
}
