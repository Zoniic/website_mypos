"use client";

import { useActionState } from "react";
import { ImageUploadField } from "../ImageUploadField";
import { SeoHint } from "../SeoHint";

export type PartnerFormValues = {
  name: string;
  websiteUrl: string;
  imageUrl: string | null;
};

const emptyValues: PartnerFormValues = { name: "", websiteUrl: "", imageUrl: null };

export function PartnerForm({
  action,
  initialValues = emptyValues,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: PartnerFormValues;
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <label className="block">
        <span className="text-sm font-medium text-text-2">Partner / company name</span>
        <input
          name="name"
          defaultValue={initialValues.name}
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1"
        />
        <SeoHint type="altText" />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-text-2">Website URL (optional)</span>
        <input
          name="websiteUrl"
          defaultValue={initialValues.websiteUrl}
          placeholder="https://..."
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1"
        />
      </label>

      <ImageUploadField
        name="image"
        label="Logo"
        currentUrl={initialValues.imageUrl}
        ratio="16/9"
        specHint="Transparent PNG preferred, roughly 300×150px. Falls back to showing the name as text until a logo is uploaded."
      />

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
