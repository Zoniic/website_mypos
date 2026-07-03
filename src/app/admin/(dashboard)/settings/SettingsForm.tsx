"use client";

import { useActionState } from "react";
import type { SiteSettings } from "@/lib/siteSettings";
import { updateSiteSettings } from "./actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1";
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
    <form action={formAction} className="max-w-2xl space-y-8">
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
        className="rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-text-1 shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
