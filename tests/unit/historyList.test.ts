import assert from "node:assert/strict";
import { test } from "node:test";
import { retentionCutoff } from "../../src/lib/audit";
import { historyQueryString, historyWhere, parseHistoryParams, summarizeChange } from "../../src/lib/historyList";

test("parseHistoryParams keeps valid filters and drops invalid ones", () => {
  const p = parseHistoryParams({ q: "  K156  ", user: "7", type: "Product", action: "delete", from: "2026-05-01", to: "2026-05-31", page: "3" });
  assert.deepEqual(p, { q: "K156", user: 7, type: "Product", action: "delete", from: "2026-05-01", to: "2026-05-31", page: 3 });
  const bad = parseHistoryParams({ user: "x", type: "Nope", action: "drop", from: "2026-02-31", to: "soon", page: "-4" });
  assert.deepEqual(bad, { q: "", user: undefined, type: undefined, action: undefined, from: undefined, to: undefined, page: 1 });
});

test("historyWhere is always limited to the last 365 days", () => {
  const now = new Date("2026-06-01T00:00:00Z");
  const where = historyWhere(parseHistoryParams({}), now);
  assert.equal(where.createdAt.gte.getTime(), retentionCutoff(now).getTime());
  // A start date older than the retention period cannot reach expired rows.
  const early = historyWhere(parseHistoryParams({ from: "2020-01-01" }), now);
  assert.equal(early.createdAt.gte.getTime(), retentionCutoff(now).getTime());
  const later = historyWhere(parseHistoryParams({ from: "2026-05-01", to: "2026-05-02" }), now);
  assert.equal(later.createdAt.gte.toISOString(), "2026-04-30T17:00:00.000Z");
  assert.equal(later.createdAt.lt?.toISOString(), "2026-05-02T17:00:00.000Z");
});

test("historyWhere applies user, type, action and search", () => {
  const where = historyWhere(parseHistoryParams({ user: "3", type: "Order", action: "status_change", q: "MP26" }));
  assert.equal(where.actorId, 3);
  assert.equal(where.entityType, "Order");
  assert.equal(where.action, "status_change");
  assert.equal(where.OR?.length, 4);
});

test("historyQueryString keeps filters and drops page 1", () => {
  const p = parseHistoryParams({ q: "a", type: "Product", page: "2" });
  assert.equal(historyQueryString(p), "q=a&type=Product&page=2");
  assert.equal(historyQueryString(p, { page: 1 }), "q=a&type=Product");
  assert.equal(historyQueryString(p, { page: undefined }), "q=a&type=Product");
});

test("summarizeChange describes status changes, logins and text edits in Thai without arrow glyphs", () => {
  const status = summarizeChange({
    action: "status_change", entityLabel: "คุณสุดา #4", detail: null,
    changes: [{ field: "status", before: "new", after: "contacted" }],
  });
  assert.equal(status, "คุณสุดา #4 · จาก ใหม่ เป็น ติดต่อแล้ว");
  assert.equal(summarizeChange({ action: "login", entityLabel: "a@b.c", detail: "ใช้รหัสสำรอง", changes: [] }), "เข้าสู่ระบบ (ใช้รหัสสำรอง)");
  const edit = summarizeChange({
    action: "update", entityLabel: "home.hero.title", detail: null,
    changes: [{ field: "value", locale: "th", before: "a", after: "b" }, { field: "value", locale: "en", before: "a", after: "b" }],
  });
  assert.equal(edit, "home.hero.title · ข้อความ · (ภาษาไทย, ภาษาอังกฤษ)");
  assert.doesNotMatch(status + edit, /[→↗✓✕]/);
});
