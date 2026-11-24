import assert from "node:assert/strict";
import { test } from "node:test";
import { createSessionToken, verifySessionToken } from "../../src/lib/adminAuth";
import { generateBackupCode } from "../../src/lib/backupCodes";
import { normalizeTotpCode } from "../../src/lib/totp";
import {
  PENDING_2FA_SECONDS,
  classifyCode,
  createPendingToken,
  formatManualKey,
  twoFactorUserKey,
  verifyPendingToken,
} from "../../src/lib/twoFactorPure";

process.env.SESSION_SECRET = "unit-test-session-secret-not-real";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET);
const otherSecret = new TextEncoder().encode("another-secret-another-secret-123");
const pending = { userId: 7, pwv: "abc123" };

test("a 6-digit code is accepted with spaces and hyphens removed", () => {
  assert.equal(normalizeTotpCode("492 301"), "492301");
  assert.equal(normalizeTotpCode("492-301"), "492301");
  assert.equal(normalizeTotpCode(" 492301 "), "492301");
});

test("codes with letters, the wrong length or no value are rejected", () => {
  assert.equal(normalizeTotpCode("49230a"), null);
  assert.equal(normalizeTotpCode("49230"), null);
  assert.equal(normalizeTotpCode("4923011"), null);
  assert.equal(normalizeTotpCode(""), null);
  assert.equal(normalizeTotpCode(undefined), null);
});

test("classifyCode tells an app code from a backup code", () => {
  assert.equal(classifyCode("492 301"), "totp");
  assert.equal(classifyCode(generateBackupCode()), "backup");
  assert.equal(classifyCode("7kq2-m9tx3b"), "backup");
  assert.equal(classifyCode("7KQ2M9TX3B"), "backup");
  assert.equal(classifyCode("hello"), null);
  assert.equal(classifyCode("12345"), null);
  assert.equal(classifyCode(null), null);
});

test("the manual key is shown in groups of four", () => {
  assert.equal(formatManualKey("JBSWY3DPEHPK3PXP"), "JBSW Y3DP EHPK 3PXP");
});

test("the per-account limit key is stable and separate from the login key", () => {
  assert.equal(twoFactorUserKey(5), "2fa:user:5");
});

test("a fresh pending token is accepted and carries the user and password version", async () => {
  const token = await createPendingToken(pending, secret);
  assert.deepEqual(await verifyPendingToken(token, secret), pending);
});

test("a pending token lasts 5 minutes", async () => {
  const issued = 1_800_000_000;
  const token = await createPendingToken(pending, secret, issued);
  const at = (seconds: number) => new Date((issued + seconds) * 1000);
  assert.deepEqual(await verifyPendingToken(token, secret, at(PENDING_2FA_SECONDS - 5)), pending);
  assert.equal(await verifyPendingToken(token, secret, at(PENDING_2FA_SECONDS + 5)), null);
  assert.equal(PENDING_2FA_SECONDS, 300);
});

test("a pending token signed with another key, or edited, is rejected", async () => {
  const token = await createPendingToken(pending, otherSecret);
  assert.equal(await verifyPendingToken(token, secret), null);
  const good = await createPendingToken(pending, secret);
  const [h, p, s] = good.split(".");
  const forged = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(p, "base64url").toString()), userId: 1 })).toString("base64url");
  assert.equal(await verifyPendingToken(`${h}.${forged}.${s}`, secret), null);
  assert.equal(await verifyPendingToken(undefined, secret), null);
  assert.equal(await verifyPendingToken("not-a-token", secret), null);
});

test("a pending token is never accepted as an admin session", async () => {
  const token = await createPendingToken(pending, secret);
  assert.equal(await verifySessionToken(token), false);
});

test("a session token is never accepted as a pending two-step login", async () => {
  const session = await createSessionToken({ userId: 7, email: "a@example.com", name: "A" }, "hash");
  assert.equal(await verifySessionToken(session), true);
  assert.equal(await verifyPendingToken(session, secret), null);
});
