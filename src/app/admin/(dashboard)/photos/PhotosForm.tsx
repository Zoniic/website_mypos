"use client";

import { useActionState } from "react";
import { ImageUploadField } from "../ImageUploadField";
import { SITE_IMAGE_SLOTS } from "./slots";
import { updateSitePhotos } from "./actions";

export function PhotosForm({ currentUrls }: { currentUrls: Record<string, string | undefined> }) {
  const [status, formAction, isPending] = useActionState(updateSitePhotos, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {SITE_IMAGE_SLOTS.map((slot) => (
        <div key={slot.key} className="rounded-xl border border-border p-4">
          <ImageUploadField
            name={slot.key}
            label={slot.label}
            currentUrl={currentUrls[slot.key]}
            ratio={slot.ratio}
            specHint={`${slot.hint} JPG, PNG, or WebP, max 5MB.`}
          />
        </div>
      ))}

      {status === "saved" && <p className="text-sm text-success">Saved.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-text-1 shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Photos"}
      </button>
    </form>
  );
}
