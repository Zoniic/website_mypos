import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";

/** Builds canonical + hreflang alternates for a locale-less pathname, e.g. "/products". */
export function buildAlternates(locale: string, pathname: string) {
  const cleanPath = pathname === "/" ? "" : pathname;
  const languages: Record<string, string> = {};

  for (const l of routing.locales) {
    languages[l] = `${siteConfig.url}/${l}${cleanPath}`;
  }
  languages["x-default"] = `${siteConfig.url}/${routing.defaultLocale}${cleanPath}`;

  return {
    canonical: `${siteConfig.url}/${locale}${cleanPath}`,
    languages,
  };
}
