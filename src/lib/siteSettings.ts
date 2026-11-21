import { unstable_cache } from "next/cache";
import { siteConfig } from "@/config/site";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_TAG, SITE_CONTENT_TTL_SECONDS } from "@/lib/siteCache";

const cacheOptions = { tags: [SITE_CONTENT_TAG], revalidate: SITE_CONTENT_TTL_SECONDS };

export type SiteSettings = {
  // Company identity, read through companyInfo(). The English values are used
  // on the en and zh pages; empty = the Thai value.
  legalName: string;
  legalNameEn: string;
  address: string;
  addressEn: string;
  /** Office number: `phone` is the tel: target, `phoneDisplay` the same number as visitors read it. */
  phone: string;
  phoneDisplay: string;
  /** Second number, shown as "Sales" next to the office number and dialled by the mobile bar's Call button. */
  salesPhone: string;
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
  legalName: "",
  legalNameEn: "",
  address: "",
  addressEn: "",
  phone: "",
  phoneDisplay: "",
  salesPhone: "",
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

export type CompanyInfo = {
  /** Brand name. */
  name: string;
  /** Registered company name; "" until it is entered. */
  legalName: string;
  /** Full address, or the short footer address copy until one is entered. */
  address: string;
  /** Office number for JSON-LD; "" until it is entered. */
  phone: string;
  /** The office number as visitors read it (falls back to `phone`). */
  phoneDisplay: string;
  /** Numbers to show, office first, then sales. Empty numbers are left out. */
  phones: CompanyPhone[];
  /** Number the mobile bar's Call button dials: the sales number, else the office number. Digits only, "" if neither. */
  callPhone: string;
  email: string;
  /** LINE chat link for the mobile bar and the footer: the setting, else siteConfig.lineUrl. */
  lineUrl: string;
};

export type CompanyPhone = {
  kind: "office" | "sales";
  /** Value for a tel: link (digits, optional leading +). */
  tel: string;
  /** Text shown to visitors. */
  display: string;
};

/** A phone number as a tel: target: keeps a leading + and the digits, drops spaces and dashes. */
export function telDigits(value: string): string {
  // Every non-digit goes, except a plus sign at the very start.
  return value.trim().replace(/(?!^\+)\D/g, "");
}

/**
 * The company's name, address, phone and email from Site Settings: the one
 * set used by the footer, the contact page, the mobile bar and the
 * Organization / LocalBusiness JSON-LD, so they always agree. Empty values
 * stay empty and callers leave them out; nothing falls back to a placeholder.
 */
export function companyInfo(settings: SiteSettings, locale: string, defaultAddress = ""): CompanyInfo {
  const localized = (th: string, en: string) => (locale === "th" ? th.trim() : en.trim() || th.trim());
  const phone = settings.phone.trim();
  const phoneDisplay = settings.phoneDisplay.trim() || phone;
  const sales = settings.salesPhone.trim();
  const phones: CompanyPhone[] = [];
  if (phone) phones.push({ kind: "office", tel: telDigits(phone), display: phoneDisplay });
  // The same number entered twice is shown once.
  if (sales && telDigits(sales) !== telDigits(phone)) phones.push({ kind: "sales", tel: telDigits(sales), display: sales });
  return {
    name: siteConfig.name,
    legalName: localized(settings.legalName, settings.legalNameEn),
    address: localized(settings.address, settings.addressEn) || defaultAddress.trim(),
    phone,
    phoneDisplay,
    phones,
    callPhone: sales ? telDigits(sales) : phone ? telDigits(phone) : "",
    email: settings.email.trim(),
    lineUrl: settings.lineUrl.trim() || siteConfig.lineUrl,
  };
}

// Read on every page (layout, metadata, header, footer): cached across requests.
const getCachedSiteSettings = unstable_cache(loadSiteSettings, ["site-settings"], cacheOptions);

/** The defaults are applied on every read, so an entry cached before a key existed still has every field. */
export async function getSiteSettings(): Promise<SiteSettings> {
  return { ...defaults, ...(await getCachedSiteSettings()) };
}

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
