"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

const localeLabels: Record<Locale, string> = {
  th: "ไทย",
  en: "EN",
  zh: "中文",
};

export function LanguageSwitcher() {
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(nextLocale: Locale) {
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center gap-1 rounded-full border border-border-strong p-1 text-sm"
    >
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleChange(locale)}
          aria-current={locale === activeLocale ? "true" : undefined}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === activeLocale
              ? "bg-surface-2 text-text-1"
              : "text-text-2 hover:bg-surface-2"
          }`}
        >
          {localeLabels[locale]}
        </button>
      ))}
    </div>
  );
}
