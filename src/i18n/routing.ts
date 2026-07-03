import { defineRouting } from "next-intl/routing";

export const locales = ["th", "en", "zh"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "th";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
