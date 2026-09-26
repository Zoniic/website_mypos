"use server";

// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { prisma } from "@/lib/prisma";
import { saveUploadedHeroBackground } from "@/lib/uploads";
import {
  TRACKING_ID_PATTERNS,
  cleanPromptPayId,
  cleanVerificationToken,
  type TrackingIdKey,
} from "@/lib/trackingIds";

const PLAIN_KEYS = [
  "phone",
  "phoneDisplay",
  "email",
  "lineId",
  "lineUrl",
  "facebookUrl",
  "youtubeUrl",
  "tiktokUrl",
  "instagramUrl",
  "mapEmbedUrl",
  "statsClients",
  "statsYears",
  "statsSupport",
  "shopeeShopUrl",
  "lazadaShopUrl",
  "tiktokShopUrl",
  "promptpayName",
  "bankName",
  "bankAccountName",
  "bankAccountNumber",
] as const;

const URL_KEYS = new Set<string>([
  "lineUrl",
  "facebookUrl",
  "youtubeUrl",
  "tiktokUrl",
  "instagramUrl",
  "shopeeShopUrl",
  "lazadaShopUrl",
  "tiktokShopUrl",
]);

const TRACKING_KEYS = Object.keys(TRACKING_ID_PATTERNS) as TrackingIdKey[];
const VERIFICATION_KEYS = ["googleSiteVerification", "bingSiteVerification", "facebookDomainVerification"] as const;

const LABELS: Record<string, string> = {
  ga4Id: "GA4 Measurement ID",
  gtmId: "Google Tag Manager ID",
  metaPixelId: "Meta Pixel ID",
  tiktokPixelId: "TikTok Pixel ID",
  lineTagId: "LINE Tag ID",
  googleAdsId: "Google Ads ID",
  googleAdsLeadLabel: "Google Ads lead conversion label",
  googleAdsPurchaseLabel: "Google Ads purchase conversion label",
  googleSiteVerification: "Google Search Console token",
  bingSiteVerification: "Bing Webmaster token",
  facebookDomainVerification: "Facebook domain verification token",
};

async function save(key: string, value: string) {
  await prisma.siteSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
}

function read(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function updateSiteSettings(_prevState: string | null, formData: FormData) {
  // Validate everything first so a bad ID never leaves settings half-saved.
  const errors: string[] = [];
  const values: Record<string, string> = {};

  for (const key of PLAIN_KEYS) {
    const value = read(formData, key);
    if (value && URL_KEYS.has(key) && !/^https:\/\/\S+$/.test(value)) {
      errors.push(`${key}: must be a full https:// link.`);
    }
    values[key] = value;
  }
  for (const key of TRACKING_KEYS) {
    const value = read(formData, key);
    if (value && !TRACKING_ID_PATTERNS[key].pattern.test(value)) {
      errors.push(`${LABELS[key]}: "${value}" doesn't look right (expected something like ${TRACKING_ID_PATTERNS[key].example}).`);
    }
    values[key] = value;
  }
  for (const key of VERIFICATION_KEYS) {
    const value = read(formData, key);
    if (value && !cleanVerificationToken(value)) {
      errors.push(`${LABELS[key]}: paste only the content="..." value, not the whole <meta> tag.`);
    }
    values[key] = value;
  }

  const promptpayRaw = read(formData, "promptpayId");
  if (promptpayRaw && !cleanPromptPayId(promptpayRaw)) {
    errors.push("PromptPay ID: use a 10-digit mobile number, a 13-digit national/tax ID or a 15-digit e-wallet ID.");
  }
  values.promptpayId = cleanPromptPayId(promptpayRaw);

  for (const key of ["shippingFee", "freeShippingMin"] as const) {
    const value = read(formData, key);
    if (value && !/^\d+$/.test(value)) errors.push(`${key}: whole baht only, e.g. 150.`);
    values[key] = value;
  }
  values.onlineOrdering = formData.get("onlineOrdering") === "on" ? "on" : "";

  if (values.onlineOrdering && !values.promptpayId && !values.bankAccountNumber) {
    errors.push("Online ordering needs a PromptPay ID or a bank account, so customers can pay.");
  }

  if (errors.length) return errors.join("\n");

  for (const [key, value] of Object.entries(values)) await save(key, value);

  let heroVideoUrl: string | null;
  try {
    heroVideoUrl = await saveUploadedHeroBackground(
      formData.get("heroVideoUrl") as File | null,
      "hero",
      "hero-background"
    );
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload hero background.";
  }
  if (heroVideoUrl) await save("heroVideoUrl", heroVideoUrl);

  revalidatePath("/[locale]", "layout");
  return "saved";
}
