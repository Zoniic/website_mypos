import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

/**
 * Single-use backup codes for two-step login. 10 characters from a
 * 31-character alphabet without look-alikes (about 50 bits), shown as
 * `XXXXX-XXXXX`. Stored only as HMAC-SHA256 with a key derived from the
 * encryption key. This module never logs.
 */

export const BACKUP_CODE_COUNT = 10;
/** No 0, O, 1, I or L. */
export const BACKUP_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const HALF = 5;

export function generateBackupCode(): string {
  let raw = "";
  for (let i = 0; i < HALF * 2; i++) raw += BACKUP_CODE_ALPHABET[randomInt(BACKUP_CODE_ALPHABET.length)];
  return `${raw.slice(0, HALF)}-${raw.slice(HALF)}`;
}

/** Ten unique codes. */
export function generateBackupCodes(count = BACKUP_CODE_COUNT): string[] {
  const codes = new Set<string>();
  while (codes.size < count) codes.add(generateBackupCode());
  return [...codes];
}

/** Uppercases and strips spaces and hyphens. */
export function normalizeBackupCode(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

/** True when the input has the right shape once normalised. */
export function isBackupCodeShape(input: string): boolean {
  const code = normalizeBackupCode(input);
  return code.length === HALF * 2 && [...code].every((ch) => BACKUP_CODE_ALPHABET.includes(ch));
}

/** Hex HMAC-SHA256 (64 characters) of the normalised code. `key` is the 32-byte encryption key. */
export function hashBackupCode(code: string, key: Buffer): string {
  const derived = createHmac("sha256", key).update("backup-codes:v1").digest();
  return createHmac("sha256", derived).update(normalizeBackupCode(code)).digest("hex");
}

/** Constant-time comparison of two stored hashes. */
export function verifyHash(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
