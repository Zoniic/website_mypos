"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import { ImageUploadField } from "../ImageUploadField";
import { SITE_IMAGE_SLOTS } from "./slots";
import { updateSitePhotos } from "./actions";

export function PhotosForm({ currentUrls }: { currentUrls: Record<string, string | undefined> }) {
  const [status, formAction, isPending] = useActionState(updateSitePhotos, null);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="max-w-2xl space-y-6">
      {SITE_IMAGE_SLOTS.map((slot) => (
        <div key={slot.key} className="rounded-xl border border-border p-4">
          <ImageUploadField
            name={slot.key}
            label={slot.label}
            currentUrl={currentUrls[slot.key]}
            ratio={slot.ratio}
            specHint={`${slot.hint} รองรับ JPG, PNG, WebP ไม่เกิน 5MB.`}
          />

          <div className="mt-3 rounded-lg border border-primary-200 bg-primary-50 p-3 text-xs leading-relaxed">
            <p className="text-text-2">
              <span className="font-semibold text-text-1">📍 ใช้ที่: </span>
              {slot.usedOn}
            </p>
            <p className="mt-1.5 text-text-2">
              <span className="font-semibold text-text-1">📷 ถ่ายอะไร: </span>
              {slot.subject}
            </p>
            <p className="mt-1.5 text-text-2">
              <span className="font-semibold text-text-1">🎨 สไตล์: </span>
              {slot.style}
            </p>
            <p className="mt-1.5 text-error">
              <span className="font-semibold">🚫 เลี่ยง: </span>
              {slot.avoid}
            </p>
          </div>
        </div>
      ))}

      {status === "saved" && <p className="text-sm text-success">Saved.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Photos"}
      </button>
    </form>
  );
}
