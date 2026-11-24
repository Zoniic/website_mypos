import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test } from "node:test";
import {
  BACKUP_CODE_ALPHABET,
  generateBackupCodes,
  hashBackupCode,
  isBackupCodeShape,
  normalizeBackupCode,
  verifyHash,
} from "../../src/lib/backupCodes";

const key = randomBytes(32);

test("ten unique codes of the form XXXXX-XXXXX without look-alike characters", () => {
  const codes = generateBackupCodes();
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  assert.equal(BACKUP_CODE_ALPHABET.length, 31);
  for (const code of codes) {
    assert.match(code, /^[A-Z2-9]{5}-[A-Z2-9]{5}$/);
    assert.ok(!/[01OIL]/.test(code), code);
    assert.ok(isBackupCodeShape(code));
  }
});

test("normalize strips hyphens and spaces and uppercases", () => {
  assert.equal(normalizeBackupCode(" abcde-fghjk "), "ABCDEFGHJK");
  assert.equal(normalizeBackupCode("ab cd-ef"), "ABCDEF");
  assert.equal(isBackupCodeShape("abcde fghjk"), true);
  assert.equal(isBackupCodeShape("ABCDE-FGHJ0"), false);
  assert.equal(isBackupCodeShape("ABCDE"), false);
});

test("hash is deterministic per key, differs per key and per code, never holds the code", () => {
  const code = "ABCDE-FGHJK";
  const h = hashBackupCode(code, key);
  assert.equal(h, hashBackupCode("abcde fghjk", key));
  assert.notEqual(h, hashBackupCode(code, randomBytes(32)));
  assert.notEqual(h, hashBackupCode("ABCDE-FGHJM", key));
  assert.match(h, /^[0-9a-f]{64}$/);
  assert.ok(!h.toUpperCase().includes("ABCDEFGHJK"));
});

test("verifyHash is true for equal hashes and false otherwise", () => {
  const h = hashBackupCode("ABCDE-FGHJK", key);
  assert.equal(verifyHash(h, h), true);
  assert.equal(verifyHash(h, hashBackupCode("ABCDE-FGHJM", key)), false);
  assert.equal(verifyHash(h, ""), false);
  assert.equal(verifyHash(h, h.slice(0, 10)), false);
});

test("the module never writes to the console", () => {
  const original = { log: console.log, error: console.error, warn: console.warn };
  let calls = 0;
  console.log = console.error = console.warn = () => {
    calls++;
  };
  try {
    const codes = generateBackupCodes();
    for (const code of codes) verifyHash(hashBackupCode(code, key), hashBackupCode(code, key));
  } finally {
    Object.assign(console, original);
  }
  assert.equal(calls, 0);
});
