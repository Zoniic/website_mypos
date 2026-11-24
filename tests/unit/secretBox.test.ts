import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import {
  decryptSecret,
  encryptSecret,
  ENCRYPTION_KEY_ENV,
  getEncryptionKey,
  isEncryptionConfigured,
} from "../../src/lib/secretBox";

const keyB64 = randomBytes(32).toString("base64");
const key = getEncryptionKey(keyB64);
const AAD = "totp:7";

test("round trip for ASCII, Thai and empty text", () => {
  for (const text of ["JBSWY3DPEHPK3PXP", "รหัสลับ ทดสอบ", ""]) {
    assert.equal(decryptSecret(encryptSecret(text, AAD, key), AAD, key), text);
  }
});

test("random IV: same text encrypts differently; output starts with v1:", () => {
  const a = encryptSecret("same", AAD, key);
  const b = encryptSecret("same", AAD, key);
  assert.notEqual(a, b);
  assert.ok(a.startsWith("v1:"));
  assert.equal(a.split(":").length, 4);
  assert.ok(!a.includes("same"));
});

test("tampering is detected: ciphertext, tag, key, AAD", () => {
  const blob = encryptSecret("secret-value", AAD, key);
  const [v, iv, tag, body] = blob.split(":");
  const flip = (s: string) => (s[0] === "A" ? "B" : "A") + s.slice(1);
  assert.throws(() => decryptSecret([v, iv, tag, flip(body)].join(":"), AAD, key));
  assert.throws(() => decryptSecret([v, iv, flip(tag), body].join(":"), AAD, key));
  assert.throws(() => decryptSecret(blob, AAD, getEncryptionKey(randomBytes(32).toString("base64"))));
  assert.throws(() => decryptSecret(blob, "totp:8", key));
  assert.throws(() => decryptSecret("v2:a:b:c", AAD, key));
  assert.throws(() => decryptSecret("garbage", AAD, key));
});

test("bad keys throw an error that names the variable and leaks nothing", () => {
  const plain = "very-secret-plaintext";
  const cases: Array<string | undefined> = [undefined, "", "not base64 !!", Buffer.alloc(16).toString("base64")];
  for (const raw of cases) {
    try {
      encryptSecret(plain, AAD, getEncryptionKey(raw));
      assert.fail("should throw");
    } catch (error) {
      const message = (error as Error).message;
      assert.ok(message.includes(ENCRYPTION_KEY_ENV), message);
      assert.ok(!message.includes(plain));
      if (raw) assert.ok(!message.includes(raw));
    }
  }
  assert.equal(isEncryptionConfigured(keyB64), true);
  assert.equal(isEncryptionConfigured("short"), false);
});

test("decrypt error does not contain plaintext or key", () => {
  const blob = encryptSecret("plain-text-value", AAD, key);
  try {
    decryptSecret(blob, "other", key);
    assert.fail("should throw");
  } catch (error) {
    const message = (error as Error).message;
    assert.ok(!message.includes("plain-text-value"));
    assert.ok(!message.includes(keyB64));
  }
});
