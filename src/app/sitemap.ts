import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";
import { solutionSlugs } from "@/data/solutions";
import { getAllProductSlugs } from "@/lib/products";

const staticPaths = [
  "",
  "/products",
  "/software",
  "/references",
  "/accessories",
  "/service",
  "/about",
  "/contact",
];

const solutionPaths = solutionSlugs.map((slug) => `/solutions/${slug}`);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const productSlugs = await getAllProductSlugs();
  const productPaths = productSlugs.map((slug) => `/products/${slug}`);
  const allPaths = [...staticPaths, ...solutionPaths, ...productPaths];

  return allPaths.flatMap((path) => {
    const languages: Record<string, string> = {};
    for (const locale of routing.locales) {
      languages[locale] = `${siteConfig.url}/${locale}${path}`;
    }

    // One <url> entry per locale, each self-referencing every language
    // variant (including itself), per Google's hreflang sitemap guidance.
    return routing.locales.map((locale) => ({
      url: `${siteConfig.url}/${locale}${path}`,
      lastModified: new Date(),
      alternates: { languages },
    }));
  });
}
