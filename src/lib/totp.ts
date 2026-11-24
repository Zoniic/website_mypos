import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * TOTP (RFC 6238) on node:crypto: HMAC-SHA1, 30 second step, 6 digits,
 * base32 secrets (RFC 4648). Pure functions, no I/O. Never log secrets or codes.
 */

export const TOTP_STEP_SECONDS = 30;
export const TOTP_DIGITS = 6;
/** Steps accepted on either side of the current one (plus or minus 30 s). */
export const TOTP_WINDOW = 1;

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

/** Decodes base32. Tolerates lowercase, spaces, hyphens and missing padding. Throws on other characters. */
export function base32Decode(text: string): Buffer {
  const clean = text.replace(/[\s-]/g, "").replace(/=+$/, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32.indexOf(ch);
    if (idx < 0) throw new Error("Invalid base32 character.");
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
    value &= (1 << bits) - 1;
  }
  return Buffer.from(out);
}

/** 20 random bytes as 32 base32 characters. */
export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

function hotp(key: Buffer, counter: number, digits: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(counter));
  const mac = createHmac("sha1", key).update(buf).digest();
  const offset = mac[mac.length - 1] & 0x0f;
  const bin =
    ((mac[offset] & 0x7f) << 24) | (mac[offset + 1] << 16) | (mac[offset + 2] << 8) | mac[offset + 3];
  return String(bin % 10 ** digits).padStart(digits, "0");
}

/** The step number (counter) for a Unix time in seconds. */
export function stepAt(unixSeconds: number): number {
  return Math.floor(unixSeconds / TOTP_STEP_SECONDS);
}

/** The code for a base32 secret at a Unix time in seconds. */
export function totpAt(secretBase32: string, unixSeconds: number, digits = TOTP_DIGITS): string {
  return hotp(base32Decode(secretBase32), stepAt(unixSeconds), digits);
}

/** Strips spaces and hyphens; returns the 6 digits or null when the input is not a valid code. */
export function normalizeTotpCode(input: string | null | undefined): string | null {
  if (typeof input !== "string") return null;
  const clean = input.replace(/[\s-]/g, "");
  return /^\d{6}$/.test(clean) ? clean : null;
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Checks a code against the previous, current and next step. Returns the
 * matched step (the caller stores it as `totpLastStep`) or null. With
 * `lastStep`, a step less than or equal to it is rejected (replay).
 */
export function verifyTotp(
  secretBase32: string,
  input: string | null | undefined,
  options: { now?: number; lastStep?: number | null; window?: number } = {},
): number | null {
  const code = normalizeTotpCode(input);
  if (!code) return null;
  const nowSeconds = options.now ?? Math.floor(Date.now() / 1000);
  const window = options.window ?? TOTP_WINDOW;
  const current = stepAt(nowSeconds);
  const key = base32Decode(secretBase32);
  let matched: number | null = null;
  for (let step = current - window; step <= current + window; step++) {
    if (step < 0) continue;
    if (options.lastStep != null && step <= options.lastStep) continue;
    if (safeEqual(hotp(key, step, TOTP_DIGITS), code) && matched === null) matched = step;
  }
  return matched;
}

/** The `otpauth://` URI that authenticator apps read from the QR code. */
export function otpauthUri(input: { issuer: string; account: string; secret: string }): string {
  const label = `${encodeURIComponent(input.issuer)}:${encodeURIComponent(input.account)}`;
  const params = new URLSearchParams({
    secret: input.secret,
    issuer: input.issuer,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
