import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_TAG, SITE_CONTENT_TTL_SECONDS } from "@/lib/siteCache";

const cacheOptions = { tags: [SITE_CONTENT_TAG], revalidate: SITE_CONTENT_TTL_SECONDS };

export type SiteSettings = {
  phone: string;
  phoneDisplay: string;
  email: string;
  lineId: string;
  lineUrl: string;
  facebookUrl: string;
  mapEmbedUrl: string;
  statsClients: string;
  statsYears: string;
  statsSupport: string;
  /** Optional looping background video for the homepage hero. Falls back
   * to the static gradient/glow background when empty. */
  heroVideoUrl: string;

  // Social profiles (Organization "sameAs" + footer links).
  youtubeUrl: string;
  tiktokUrl: string;
  instagramUrl: string;

  // Tracking & ads — see src/lib/trackingIds.ts for the accepted formats.
  ga4Id: string;
  gtmId: string;
  metaPixelId: string;
  tiktokPixelId: string;
  lineTagId: string;
  googleAdsId: string;
  googleAdsLeadLabel: string;
  googleAdsPurchaseLabel: string;

  // Search engine / platform ownership verification (meta tags).
  googleSiteVerification: string;
  bingSiteVerification: string;
  facebookDomainVerification: string;

  // Sales channels.
  shopeeShopUrl: string;
  lazadaShopUrl: string;
  tiktokShopUrl: string;
  /** "on" to show "Add to cart" on items that have an online price. */
  onlineOrdering: string;
  /** Flat delivery fee in THB (string, parsed where used). */
  shippingFee: string;
  /** Order subtotal (THB) from which delivery is free; empty = never free. */
  freeShippingMin: string;
  promptpayId: string;
  promptpayName: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
};

const defaults: SiteSettings = {
  phone: "",
  phoneDisplay: "",
  email: "",
  lineId: "",
  lineUrl: "",
  facebookUrl: "",
  mapEmbedUrl: "",
  statsClients: "",
  statsYears: "",
  statsSupport: "",
  heroVideoUrl: "",
  youtubeUrl: "",
  tiktokUrl: "",
  instagramUrl: "",
  ga4Id: "",
  gtmId: "",
  metaPixelId: "",
  tiktokPixelId: "",
  lineTagId: "",
  googleAdsId: "",
  googleAdsLeadLabel: "",
  googleAdsPurchaseLabel: "",
  googleSiteVerification: "",
  bingSiteVerification: "",
  facebookDomainVerification: "",
  shopeeShopUrl: "",
  lazadaShopUrl: "",
  tiktokShopUrl: "",
  onlineOrdering: "",
  shippingFee: "",
  freeShippingMin: "",
  promptpayId: "",
  promptpayName: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
};

/** Delivery fee for a given subtotal, from the admin's shipping settings. */
export function shippingFeeFor(settings: SiteSettings, subtotal: number): number {
  const fee = Math.max(0, Math.round(Number(settings.shippingFee) || 0));
  const freeMin = Number(settings.freeShippingMin);
  if (settings.freeShippingMin.trim() && Number.isFinite(freeMin) && subtotal >= freeMin) return 0;
  return fee;
}

export function isOnlineOrderingOn(settings: SiteSettings): boolean {
  return settings.onlineOrdering === "on";
}

// Read on every page (layout, metadata, header, footer): cached across requests.
export const getSiteSettings = unstable_cache(loadSiteSettings, ["site-settings"], cacheOptions);

export const getSiteImages = unstable_cache(loadSiteImages, ["site-images"], cacheOptions);

/** The bundled logo, used until one is uploaded in Site Photos ("logo"). */
export const DEFAULT_LOGO = "/images/brand/logo.png";

export async function getLogoUrl(): Promise<string> {
  return (await getSiteImages()).logo ?? DEFAULT_LOGO;
}

async function loadSiteSettings(): Promise<SiteSettings> {
  const rows = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...defaults, ...map } as SiteSettings;
}

async function loadSiteImages(): Promise<Record<string, string | undefined>> {
  const rows = await prisma.siteImage.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.url ?? undefined]));
}

export async function getTrustLogos() {
  return prisma.trustLogo.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getOfficialPartners() {
  return prisma.officialPartner.findMany({ orderBy: { sortOrder: "asc" } });
}
