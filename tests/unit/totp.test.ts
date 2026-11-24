import assert from "node:assert/strict";
import { test } from "node:test";
import {
  base32Decode,
  base32Encode,
  generateSecret,
  normalizeTotpCode,
  otpauthUri,
  totpAt,
  verifyTotp,
} from "../../src/lib/totp";

const RFC_SECRET = base32Encode(Buffer.from("12345678901234567890"));

test("RFC 6238 Appendix B SHA1 vectors (8 digits)", () => {
  const vectors: Array<[number, string]> = [
    [59, "94287082"],
    [1111111109, "07081804"],
    [1111111111, "14050471"],
    [1234567890, "89005924"],
    [2000000000, "69279037"],
    [20000000000, "65353130"],
  ];
  for (const [time, code] of vectors) assert.equal(totpAt(RFC_SECRET, time, 8), code, `T=${time}`);
});

test("6 digit code is the last 6 digits of the 8 digit vector", () => {
  assert.equal(totpAt(RFC_SECRET, 59), "287082");
});

test("base32 follows RFC 4648 and tolerates sloppy input", () => {
  assert.equal(base32Encode(Buffer.from("foobar")), "MZXW6YTBOI");
  assert.equal(base32Decode("MZXW6YTBOI").toString(), "foobar");
  assert.equal(base32Decode("mzxw 6ytb-oi").toString(), "foobar");
  assert.equal(base32Decode("MZXW6YQ").toString(), "foob");
  assert.equal(base32Decode("MZXW6YQ=").toString(), "foob");
  for (let i = 0; i < 20; i++) {
    const bytes = Buffer.from(Array.from({ length: i + 1 }, () => Math.floor(Math.random() * 256)));
    assert.deepEqual(base32Decode(base32Encode(bytes)), bytes);
  }
  assert.throws(() => base32Decode("MZXW6!"));
  assert.throws(() => base32Decode("MZXW618"));
});

test("window accepts one step either side, not two", () => {
  const secret = generateSecret();
  const now = 1_700_000_010;
  assert.ok(verifyTotp(secret, totpAt(secret, now - 30), { now }) !== null);
  assert.ok(verifyTotp(secret, totpAt(secret, now), { now }) !== null);
  assert.ok(verifyTotp(secret, totpAt(secret, now + 30), { now }) !== null);
  assert.equal(verifyTotp(secret, totpAt(secret, now - 60), { now }), null);
  assert.equal(verifyTotp(secret, totpAt(secret, now + 60), { now }), null);
});

test("replay: a step at or below lastStep is rejected and the matched step is returned", () => {
  const secret = generateSecret();
  const now = 1_700_000_010;
  const code = totpAt(secret, now);
  const step = verifyTotp(secret, code, { now });
  assert.equal(step, Math.floor(now / 30));
  assert.equal(verifyTotp(secret, code, { now, lastStep: step }), null);
  assert.equal(verifyTotp(secret, code, { now, lastStep: step! - 1 }), step);
  // An older code from the window is also rejected once a newer step was used.
  assert.equal(verifyTotp(secret, totpAt(secret, now - 30), { now, lastStep: step }), null);
});

test("input rules: strip spaces and hyphens, then exactly 6 digits", () => {
  assert.equal(normalizeTotpCode("123 456"), "123456");
  assert.equal(normalizeTotpCode("123-456"), "123456");
  assert.equal(normalizeTotpCode("12345"), null);
  assert.equal(normalizeTotpCode("1234567"), null);
  assert.equal(normalizeTotpCode("12345a"), null);
  assert.equal(normalizeTotpCode(""), null);
  assert.equal(normalizeTotpCode("   "), null);
  assert.equal(normalizeTotpCode(null), null);
  const secret = generateSecret();
  const now = 1_700_000_010;
  const code = totpAt(secret, now);
  assert.ok(verifyTotp(secret, `${code.slice(0, 3)} ${code.slice(3)}`, { now }) !== null);
  assert.equal(verifyTotp(secret, "abcdef", { now }), null);
  assert.equal(verifyTotp(secret, "", { now }), null);
});

test("generateSecret gives 32 base32 characters and differs per call", () => {
  const a = generateSecret();
  const b = generateSecret();
  assert.match(a, /^[A-Z2-7]{32}$/);
  assert.notEqual(a, b);
});

test("otpauthUri carries issuer, encoded account, secret, digits and period", () => {
  const uri = otpauthUri({ issuer: "MYPOS Admin", account: "a+b@example.com", secret: "ABCDEFGH" });
  assert.ok(uri.startsWith("otpauth://totp/MYPOS%20Admin:a%2Bb%40example.com?"));
  const params = new URL(uri).searchParams;
  assert.equal(params.get("secret"), "ABCDEFGH");
  assert.equal(params.get("issuer"), "MYPOS Admin");
  assert.equal(params.get("digits"), "6");
  assert.equal(params.get("period"), "30");
});
