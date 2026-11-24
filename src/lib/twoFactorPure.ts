import { SignJWT, jwtVerify } from "jose";
import { isBackupCodeShape, normalizeBackupCode } from "@/lib/backupCodes";
import { normalizeTotpCode } from "@/lib/totp";

/**
 * Pure parts of the two-step login (no database, no cookies), so the unit
 * tests can run them directly.
 */

/** Cookie that carries "password was right, code still needed" between the two login steps. */
export const PENDING_2FA_COOKIE = "mypos_admin_2fa";
export const PENDING_2FA_SECONDS = 5 * 60;
const PURPOSE = "2fa";

export type PendingTwoFactor = { userId: number; pwv: string };

/**
 * Signs the pending token. It has `purpose: "2fa"` and no `role: "admin"`
 * claim, so the session check (verifySessionToken) never accepts it as a session.
 */
export async function createPendingToken(
  pending: PendingTwoFactor,
  secret: Uint8Array,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<string> {
  return new SignJWT({ purpose: PURPOSE, userId: pending.userId, pwv: pending.pwv })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(nowSeconds)
    .setExpirationTime(nowSeconds + PENDING_2FA_SECONDS)
    .sign(secret);
}

/** Returns the pending login, or null when the token is missing, forged, expired or of another kind. */
export async function verifyPendingToken(
  token: string | undefined,
  secret: Uint8Array,
  now: Date = new Date(),
): Promise<PendingTwoFactor | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret, { currentDate: now });
    if (payload.purpose !== PURPOSE) return null;
    if (typeof payload.userId !== "number" || typeof payload.pwv !== "string") return null;
    return { userId: payload.userId, pwv: payload.pwv };
  } catch {
    return null;
  }
}

/** What a typed code looks like: a 6-digit app code, a backup code, or neither. Spaces and hyphens are ignored. */
export function classifyCode(input: string | null | undefined): "totp" | "backup" | null {
  if (typeof input !== "string") return null;
  if (normalizeTotpCode(input)) return "totp";
  return isBackupCodeShape(normalizeBackupCode(input)) ? "backup" : null;
}

/** The manual key in groups of four, as authenticator apps show it. */
export function formatManualKey(secret: string): string {
  return secret.replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
}

/** Limit key for wrong codes of one account, so many IP addresses cannot guess one account's code. */
export const twoFactorUserKey = (userId: number) => `2fa:user:${userId}`;

export const TWO_FACTOR_MESSAGES = {
  wrongCode: "รหัสไม่ถูกต้องหรือหมดเวลา ลองรหัสใหม่จากแอป",
  tooMany: "ลองผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่",
  notConfigured: "เปิดรหัส 2 ขั้นตอนไม่ได้ เพราะเซิร์ฟเวอร์ยังไม่ได้ตั้งค่ากุญแจเข้ารหัส ติดต่อเจ้าของเว็บไซต์",
  keyMismatch: "อ่านรหัสลับของบัญชีนี้ไม่ได้ ติดต่อเจ้าของเว็บไซต์เพื่อรีเซ็ตรหัส 2 ขั้นตอน",
  expired: "หมดเวลาแล้ว กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
} as const;
