"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";
import { updateContent } from "./actions";
import { getPreviewPath } from "./previewPaths";
import { CharCounter, SeoHint } from "../SeoHint";
import { ContentGuidePanel, getContentGuide } from "./ContentGuidePanel";

const PREVIEW_LOCALES = ["th", "en", "zh"] as const;

function seoFieldKind(key: string): "metaTitle" | "metaDescription" | null {
  if (key.endsWith("metaTitle")) return "metaTitle";
  if (key.endsWith("metaDescription")) return "metaDescription";
  return null;
}

export function ContentForm({
  namespace,
  keys,
  values,
}: {
  namespace: string;
  keys: string[];
  values: Record<string, string>;
}) {
  const boundAction = updateContent.bind(null, namespace);
  const [status, formAction, isPending] = useActionState(boundAction, null);
  const isError = status !== null && status !== "saved";

  const previewPath = getPreviewPath(namespace);
  const [previewLocale, setPreviewLocale] = useState<(typeof PREVIEW_LOCALES)[number]>("th");
  const [previewNonce, setPreviewNonce] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-refresh the preview iframe right after a successful save — computed
  // during render (not an effect) by comparing against the previous status.
  const [prevStatus, setPrevStatus] = useState(status);
  if (status !== prevStatus) {
    setPrevStatus(status);
    if (status === "saved") setPreviewNonce((n) => n + 1);
  }

  const previewSrc = `/${previewLocale}${previewPath}`;

  const initialCounts: Record<string, number> = {};
  for (const key of keys) {
    if (!seoFieldKind(key)) continue;
    for (const locale of ["th", "en", "zh"] as const) {
      const fieldKey = `${key}__${locale}`;
      initialCounts[fieldKey] = (values[fieldKey] ?? "").length;
    }
  }
  const [counts, setCounts] = useState(initialCounts);

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
      <form action={formAction} className="max-w-4xl space-y-6">
        {keys.map((key) => (
          <fieldset key={key} className="rounded-xl border border-border p-4">
            <legend className="px-1 font-mono text-sm text-text-2">{key}</legend>
            {(() => {
              const guide = getContentGuide(namespace, key);
              return guide ? <ContentGuidePanel entry={guide} /> : null;
            })()}
            {seoFieldKind(key) && <SeoHint type={seoFieldKind(key)!} />}
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {(["th", "en", "zh"] as const).map((locale) => {
                const fieldKey = `${key}__${locale}`;
                const value = values[fieldKey] ?? "";
                const isLong = value.length > 80 || value.trim().startsWith("[");
                const seoKind = seoFieldKind(key);
                return (
                  <label key={locale} className="block">
                    <span className="text-xs font-semibold uppercase text-text-2">{locale}</span>
                    <textarea
                      name={fieldKey}
                      defaultValue={value}
                      rows={isLong ? 6 : 2}
                      className="mt-1 w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 font-mono text-xs text-text-1"
                      onChange={
                        seoKind
                          ? (e) =>
                              setCounts((prev) => ({ ...prev, [fieldKey]: e.target.value.length }))
                          : undefined
                      }
                    />
                    {seoKind === "metaTitle" && (
                      <CharCounter length={counts[fieldKey] ?? value.length} min={30} max={60} />
                    )}
                    {seoKind === "metaDescription" && (
                      <CharCounter length={counts[fieldKey] ?? value.length} min={120} max={160} />
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        {status === "saved" && <p className="text-sm text-success">Saved. Preview refreshed →</p>}
        {isError && <p className="text-sm text-error">{status}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-button bg-[image:var(--gradient-primary)] px-6 py-2.5 font-semibold text-white shadow-[var(--shadow-glow-primary)] disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save All Changes"}
        </button>
      </form>

      <div className="lg:sticky lg:top-6 lg:self-start">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-lg border border-border-strong bg-surface-0 p-1">
            {PREVIEW_LOCALES.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setPreviewLocale(locale)}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold uppercase ${
                  previewLocale === locale
                    ? "bg-[image:var(--gradient-primary)] text-white"
                    : "text-text-2 hover:text-text-1"
                }`}
              >
                {locale}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPreviewNonce((n) => n + 1)}
            className="rounded-lg border border-border-strong px-2.5 py-1 text-xs text-text-2 hover:bg-surface-2 hover:text-text-1"
          >
            Refresh
          </button>
        </div>

        <div className="mt-2 overflow-hidden rounded-xl border border-border bg-surface-0">
          <iframe
            ref={iframeRef}
            key={previewNonce}
            src={previewSrc}
            title="Live preview"
            className="h-[70vh] w-full"
          />
        </div>
        <p className="mt-1 text-xs text-text-2">
          Previewing <code className="font-mono">{previewSrc}</code> — save to refresh, or use
          Refresh above.
        </p>
      </div>
    </div>
  );
}
