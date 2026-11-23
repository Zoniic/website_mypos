import { test } from "node:test";
import assert from "node:assert/strict";
import { EMAIL_PATTERN, HONEYPOT_FIELD, MAX, isBotSubmission, parseQuoteLines, textField } from "@/lib/formInput";

test("textField trims, caps length and treats a missing key as empty", () => {
  const fd = new FormData();
  fd.set("a", "  hello  ");
  fd.set("long", "x".repeat(5000));
  assert.equal(textField(fd, "a", 50), "hello");
  assert.equal(textField(fd, "long", MAX.message).length, MAX.message);
  assert.equal(textField(fd, "missing", 10), "");
});

test("EMAIL_PATTERN accepts normal addresses and rejects broken ones", () => {
  assert.ok(EMAIL_PATTERN.test("sales@fmtcorp.co.th"));
  assert.ok(!EMAIL_PATTERN.test("a@b"));
  assert.ok(!EMAIL_PATTERN.test("a b@c.com"));
  assert.ok(!EMAIL_PATTERN.test(""));
});

test("parseQuoteLines accepts a valid cart", () => {
  const lines = parseQuoteLines(JSON.stringify([{ slug: "mypos-k1", name: "K1", quantity: 2 }]));
  assert.deepEqual(lines, [{ slug: "mypos-k1", name: "K1", quantity: 2 }]);
});

test("parseQuoteLines rejects malformed carts instead of crashing", () => {
  assert.equal(parseQuoteLines("{oops"), null);
  assert.equal(parseQuoteLines("[]"), null);
  assert.equal(parseQuoteLines("[null]"), null);
  assert.equal(parseQuoteLines('"text"'), null);
  assert.equal(parseQuoteLines(JSON.stringify([{ name: "x", quantity: 1 }])), null);
  const tooMany = Array.from({ length: 51 }, () => ({ slug: "a", name: "b", quantity: 1 }));
  assert.equal(parseQuoteLines(JSON.stringify(tooMany)), null);
});

test("parseQuoteLines clamps quantities and caps text", () => {
  const parse = (quantity: unknown) => parseQuoteLines(JSON.stringify([{ slug: "a", name: "b", quantity }]))?.[0].quantity;
  assert.equal(parse(-5), 1);
  assert.equal(parse(100000), 999);
  assert.equal(parse("abc"), 1);
  assert.equal(parse(2.6), 3);
  const long = parseQuoteLines(JSON.stringify([{ slug: "a", name: "n".repeat(900), quantity: 1 }]));
  assert.equal(long?.[0].name.length, MAX.product);
});

test("isBotSubmission is true only when the hidden field has a value", () => {
  const human = new FormData();
  human.set(HONEYPOT_FIELD, "");
  assert.equal(isBotSubmission(human), false);
  assert.equal(isBotSubmission(new FormData()), false);
  const bot = new FormData();
  bot.set(HONEYPOT_FIELD, "http://spam.example");
  assert.equal(isBotSubmission(bot), true);
});
