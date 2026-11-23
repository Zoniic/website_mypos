import { test } from "node:test";
import assert from "node:assert/strict";
import { csvDate, csvField, toCsv } from "@/lib/csv";

test("csvField quotes every value and doubles inner quotes", () => {
  assert.equal(csvField("abc"), '"abc"');
  assert.equal(csvField('say "hi"'), '"say ""hi"""');
  assert.equal(csvField("a,b\nc"), '"a,b\nc"');
  assert.equal(csvField(null), '""');
  assert.equal(csvField(undefined), '""');
  assert.equal(csvField(42), '"42"');
});

test("csvField neutralizes spreadsheet formulas", () => {
  for (const evil of ["=1+1", "+cmd", "-2", "@SUM(A1)", "  =HYPERLINK()", "\tx"]) {
    assert.ok(csvField(evil).startsWith(`"'`), `not guarded: ${evil}`);
  }
  assert.equal(csvField("ร้านอาหาร"), '"ร้านอาหาร"');
});

test("csvDate writes Bangkok time", () => {
  assert.equal(csvDate(new Date("2026-11-23T00:00:00Z")), "2026-11-23T07:00:00+07:00");
  assert.equal(csvDate(null), "");
});

test("toCsv starts with a BOM and ends rows with CRLF", () => {
  const out = toCsv(["name", "phone"], [["สมชาย", "0812345678"]]);
  assert.ok(out.startsWith("\uFEFF"));
  assert.equal(out, '\uFEFF"name","phone"\r\n"สมชาย","0812345678"\r\n');
});
