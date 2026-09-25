/**
 * Formats for every tracking/verification ID an admin can paste into Site
 * Settings. These IDs are interpolated into inline <script> tags, so each
 * one is checked against its vendor's exact format both when saved and
 * again when rendered — a malformed value is dropped, never emitted.
 */
export const TRACKING_ID_PATTERNS = {
  ga4Id: { pattern: /^G-[A-Z0-9]{4,16}$/, example: "G-ABC123XYZ9" },
  gtmId: { pattern: /^GTM-[A-Z0-9]{4,12}$/, example: "GTM-ABC1234" },
  metaPixelId: { pattern: /^\d{10,20}$/, example: "123456789012345" },
  tiktokPixelId: { pattern: /^[A-Z0-9]{15,30}$/, example: "C1ABCDEF23GHIJKLMN45" },
  lineTagId: { pattern: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/, example: "0a1b2c3d-4e5f-6789-abcd-ef0123456789" },
  googleAdsId: { pattern: /^AW-\d{6,14}$/, example: "AW-123456789" },
  googleAdsLeadLabel: { pattern: /^[A-Za-z0-9_-]{6,40}$/, example: "AbC-D_efGhIjKlMn" },
  googleAdsPurchaseLabel: { pattern: /^[A-Za-z0-9_-]{6,40}$/, example: "AbC-D_efGhIjKlMn" },
} as const;

export type TrackingIdKey = keyof typeof TRACKING_ID_PATTERNS;

/** Returns the trimmed ID if it matches its vendor format, otherwise "". */
export function cleanTrackingId(key: TrackingIdKey, value: string | undefined | null): string {
  const trimmed = (value ?? "").trim();
  return TRACKING_ID_PATTERNS[key].pattern.test(trimmed) ? trimmed : "";
}

/** Verification tokens go into <meta content="...">; allow only token-safe characters. */
export function cleanVerificationToken(value: string | undefined | null): string {
  const trimmed = (value ?? "").trim();
  return /^[A-Za-z0-9_\-.=]{8,100}$/.test(trimmed) ? trimmed : "";
}

/** PromptPay target: 10-digit mobile, 13-digit national/tax ID or 15-digit e-wallet. */
export function cleanPromptPayId(value: string | undefined | null): string {
  const digits = (value ?? "").replace(/[\s-]/g, "");
  return /^(\d{10}|\d{13}|\d{15})$/.test(digits) ? digits : "";
}
