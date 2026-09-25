"use client";

import { useActionState } from "react";
import { submitWithoutReset } from "@/lib/submitWithoutReset";
import type { SiteSettings } from "@/lib/siteSettings";
import { HeroBackgroundUploadField } from "../HeroBackgroundUploadField";
import { updateSiteSettings } from "./actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40 px-3 py-2 text-sm text-text-1";
const labelClass = "text-sm font-medium text-text-2";

function Field({
  label,
  name,
  defaultValue,
  hint,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {hint && <p className="text-xs text-text-2">{hint}</p>}
      <input name={name} defaultValue={defaultValue} className={inputClass} />
    </label>
  );
}

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [status, formAction, isPending] = useActionState(updateSiteSettings, null);

  return (
    <form onSubmit={submitWithoutReset(formAction)} className="max-w-2xl space-y-8">
      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Contact</h3>
        <Field label="Phone (tel: link, e.g. +66-2-123-4567)" name="phone" defaultValue={settings.phone} />
        <Field label="Phone (display text, e.g. 02-123-4567)" name="phoneDisplay" defaultValue={settings.phoneDisplay} />
        <Field label="Email" name="email" defaultValue={settings.email} />
        <Field label="LINE ID (e.g. @mypos)" name="lineId" defaultValue={settings.lineId} />
        <Field
          label="LINE chat link"
          name="lineUrl"
          defaultValue={settings.lineUrl}
          hint="Full URL, e.g. https://line.me/R/ti/p/@mypos"
        />
        <Field label="Facebook page URL" name="facebookUrl" defaultValue={settings.facebookUrl} />
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Homepage Hero</h3>
        <HeroBackgroundUploadField
          name="heroVideoUrl"
          label="Background video or image (optional)"
          currentUrl={settings.heroVideoUrl}
          specHint="Leave empty to use the default animated gradient background. Upload a short, muted, looping MP4 clip of the product/hardware in use, or a still JPG/PNG/WebP image. MP4 max 50MB, image max 5MB."
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Map</h3>
        <Field
          label="Google Maps embed URL"
          name="mapEmbedUrl"
          defaultValue={settings.mapEmbedUrl}
          hint="From Google Maps: Share > Embed a map > copy the src=&quot;...&quot; URL"
        />
      </section>

      <section className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold uppercase text-text-2">Homepage Stats</h3>
        <Field label="Businesses served" name="statsClients" defaultValue={settings.statsClients} />
        <Field label="Years of experience" name="statsYears" defaultValue={settings.statsYears} />
        <Field label="Support availability" name="statsSupport" defaultValue={settings.statsSupport} />
      </section>

      {status === "saved" && <p className="text-sm text-success">Saved.</p>}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
