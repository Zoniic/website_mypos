import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * AES-256-GCM encryption for small secrets (the TOTP secret). The key comes
 * from the environment variable below (base64, 32 bytes). Stored format:
 * `v1:<iv>:<tag>:<ciphertext>` with base64url parts. The additional
 * authenticated data (AAD) binds a blob to its owner, for example
 * `totp:<userId>`, so a blob cannot be moved to another row.
 *
 * Error messages name the variable only. They never contain the key or the
 * plaintext.
 */

export const ENCRYPTION_KEY_ENV = "TWO_FACTOR_ENCRYPTION_KEY";

const VERSION = "v1";
const IV_BYTES = 12;
const TAG_BYTES = 16;

/** Decodes and checks the key. `raw` defaults to the environment variable. */
export function getEncryptionKey(raw: string | undefined = process.env[ENCRYPTION_KEY_ENV]): Buffer {
  if (!raw || !raw.trim()) {
    throw new Error(`${ENCRYPTION_KEY_ENV} is not set.`);
  }
  const text = raw.trim();
  if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(text)) {
    throw new Error(`${ENCRYPTION_KEY_ENV} must be base64.`);
  }
  const key = Buffer.from(text, "base64");
  if (key.length !== 32) {
    throw new Error(`${ENCRYPTION_KEY_ENV} must decode to exactly 32 bytes.`);
  }
  return key;
}

/** True when the key is present and valid. Never throws. */
export function isEncryptionConfigured(raw?: string): boolean {
  try {
    getEncryptionKey(raw ?? process.env[ENCRYPTION_KEY_ENV]);
    return true;
  } catch {
    return false;
  }
}

export function encryptSecret(plain: string, aad: string, key: Buffer = getEncryptionKey()): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const body = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), body.toString("base64url")].join(":");
}

export function decryptSecret(blob: string, aad: string, key: Buffer = getEncryptionKey()): string {
  const parts = blob.split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("Encrypted value has an unknown format.");
  }
  const iv = Buffer.from(parts[1], "base64url");
  const tag = Buffer.from(parts[2], "base64url");
  const body = Buffer.from(parts[3], "base64url");
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new Error("Encrypted value has an unknown format.");
  }
  try {
    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAAD(Buffer.from(aad, "utf8"));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("Encrypted value could not be verified.");
  }
}
