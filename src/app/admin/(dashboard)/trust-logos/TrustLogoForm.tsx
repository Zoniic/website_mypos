"use client";

import { useActionState } from "react";
import { ImageUploadField } from "../ImageUploadField";

export type TrustLogoFormValues = {
  name: string;
  imageUrl: string | null;
};

const emptyValues: TrustLogoFormValues = { name: "", imageUrl: null };

export function TrustLogoForm({
  action,
  initialValues = emptyValues,
  submitLabel,
}: {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>;
  initialValues?: TrustLogoFormValues;
  submitLabel: string;
}) {
  const [error, formAction, isPending] = useActionState(action, null);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <label className="block">
        <span className="text-sm font-medium text-text-2">Company / brand name</span>
        <input
          name="name"
          defaultValue={initialValues.name}
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1"
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
        className="rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-text-1 shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
