import { test } from "node:test";
import assert from "node:assert/strict";
import { hasEmoji, stripEmoji } from "@/lib/emoji";
import { detectFileKind, signatureMatchesMime } from "@/lib/imageSignature";
import { googleMapsOpenUrl, isGoogleMapsEmbedUrl, isShowableStat } from "@/lib/siteDisplay";

test("emoji rule: emoji are found and stripped, legal marks are kept", () => {
  assert.equal(hasEmoji("ร้านอาหาร"), false);
  assert.equal(hasEmoji("MYPOS © 2026 ®"), false);
  assert.equal(hasEmoji("ออเดอร์ใหม่ \u{1F6D2}"), true);
  assert.equal(stripEmoji("\u{1F3AF} ขอนัดสาธิต"), "ขอนัดสาธิต");
});

test("upload signature check: real bytes must match the declared type", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 1, 2, 3, 4, 0x57, 0x45, 0x42, 0x50]);
  const text = new TextEncoder().encode("hello, not an image");
  assert.equal(detectFileKind(png), "png");
  assert.equal(detectFileKind(jpeg), "jpeg");
  assert.equal(detectFileKind(webp), "webp");
  assert.equal(detectFileKind(text), null);
  assert.equal(signatureMatchesMime(png, "image/png"), true);
  assert.equal(signatureMatchesMime(text, "image/png"), false, "a text file renamed .png must be rejected");
  assert.equal(signatureMatchesMime(jpeg, "image/png"), false);
  assert.equal(signatureMatchesMime(png, "image/gif"), false);
});

test("map: only a real Google Maps embed URL goes into the iframe", () => {
  assert.ok(isGoogleMapsEmbedUrl("https://www.google.com/maps/embed?pb=!1m18"));
  assert.ok(!isGoogleMapsEmbedUrl("https://www.google.com/maps?q=bangkok&output=search"));
  assert.ok(!isGoogleMapsEmbedUrl("http://www.google.com/maps/embed?pb=x"));
  assert.ok(!isGoogleMapsEmbedUrl("https://evil.example/maps/embed?pb=x"));
  assert.match(googleMapsOpenUrl("", "กรุงเทพฯ"), /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
});

test("stats band: short figures are shown, URLs and long text are not", () => {
  for (const ok of ["500+", "30 ปี", "24/7"]) assert.ok(isShowableStat(ok), ok);
  for (const bad of ["https://www.fm1896p.co.th/", "www.example.com", "example.co.th", "", "a very long sentence here"]) {
    assert.ok(!isShowableStat(bad), bad);
  }
});
