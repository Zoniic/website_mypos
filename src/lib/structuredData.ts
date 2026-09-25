import { siteConfig } from "@/config/site";
import type { SiteSettings } from "@/lib/siteSettings";

/** Uploaded images are stored as site-relative or absolute (Supabase) URLs. */
export function absoluteUrl(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${siteConfig.url}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function schemaAvailability(stockStatus: string): string {
  if (stockStatus === "preorder") return "https://schema.org/PreOrder";
  if (stockStatus === "out_of_stock") return "https://schema.org/OutOfStock";
  return "https://schema.org/InStock";
}

/** Official profiles for Organization "sameAs" — feeds Google's brand knowledge panel. */
export function organizationSameAs(settings: SiteSettings): string[] {
  return [
    settings.facebookUrl,
    settings.youtubeUrl,
    settings.tiktokUrl,
    settings.instagramUrl,
    settings.lineUrl,
    settings.shopeeShopUrl,
    settings.lazadaShopUrl,
    settings.tiktokShopUrl,
  ].filter((url) => /^https:\/\//.test(url));
}
