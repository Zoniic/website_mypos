"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

const localeLabels: Record<Locale, string> = {
  th: "ไทย",
  en: "EN",
  zh: "中文",
};

// Collapses to a single trigger showing the active language instead of an
// always-expanded 3-button pill, which was competing with the primary CTA
// for visual weight in the header.
export function LanguageSwitcher() {
  const activeLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function handleChange(nextLocale: Locale) {
    setOpen(false);
    // Read the query string at click-time (rather than subscribing via
    // useSearchParams) so this sitewide component never needs a Suspense
    // boundary — it just needs to preserve whatever filters are active.
    const query = window.location.search;
    router.replace(`${pathname}${query}`, { locale: nextLocale });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Language"
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-1 rounded-full border border-border-strong px-3 py-1.5 text-sm text-text-2 outline-offset-2 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
      >
        {localeLabels[activeLocale]}
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M1 3l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.5" />
        </svg>
      </button>
      {open && (
        <div
          role="group"
          aria-label="Language"
          className="absolute right-0 top-full mt-2 w-28 rounded-lg border border-border bg-surface-1 p-1 shadow-lg"
        >
          {locales.map((locale) => (
            <button
              key={locale}
              type="button"
              onClick={() => handleChange(locale)}
              aria-current={locale === activeLocale ? "true" : undefined}
              className={`block w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 ${
                locale === activeLocale
                  ? "bg-surface-2 text-text-1"
                  : "text-text-2 hover:bg-surface-2 hover:text-text-1"
              }`}
            >
              {localeLabels[locale]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
