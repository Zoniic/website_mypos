import { test } from "node:test";
import assert from "node:assert/strict";
import { LEAD_NOTE_MAX, leadPagination, leadQueryString, parseLeadDetails, parseLeadParams } from "@/lib/leadList";

test("parseLeadParams keeps valid filters and drops invalid ones", () => {
  const p = parseLeadParams("contact", { status: "new", q: "  K1 ", assignee: "3", topic: "demo", from: "2026-11-01", to: "2026-02-30", page: "2" });
  assert.equal(p.status, "new");
  assert.equal(p.q, "K1");
  assert.equal(p.assignee, 3);
  assert.equal(p.topic, "demo");
  assert.equal(p.from, "2026-11-01");
  assert.equal(p.to, undefined, "an impossible date is ignored");
  assert.equal(p.page, 2);

  const bad = parseLeadParams("warranty", { status: "new", topic: "demo", assignee: "x", page: "-1" });
  assert.equal(bad.status, undefined, "warranty has no 'new' status");
  assert.equal(bad.topic, undefined, "topic is for contact messages only");
  assert.equal(bad.assignee, "all");
  assert.equal(bad.page, 1);
  assert.equal(parseLeadParams("quote", { assignee: "none" }).assignee, "none");
  assert.equal(parseLeadParams("quote", { q: "x".repeat(500) }).q.length, 100);
});

test("leadPagination clamps the page into range", () => {
  assert.deepEqual(leadPagination(1, 0), { page: 1, pageCount: 1, total: 0, skip: 0 });
  assert.deepEqual(leadPagination(3, 60), { page: 3, pageCount: 3, total: 60, skip: 50 });
  assert.equal(leadPagination(99, 60).page, 3);
  assert.equal(leadPagination(-4, 60).page, 1);
});

test("leadQueryString keeps active filters and drops page 1", () => {
  const p = parseLeadParams("contact", { status: "closed", q: "ร้าน", page: "2" });
  const qs = new URLSearchParams(leadQueryString(p));
  assert.equal(qs.get("status"), "closed");
  assert.equal(qs.get("q"), "ร้าน");
  assert.equal(qs.get("page"), "2");
  assert.equal(new URLSearchParams(leadQueryString(p, { page: 1 })).has("page"), false);
});

test("parseLeadDetails validates the note and assignee fields", () => {
  const form = (fields: Record<string, string>) => {
    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);
    return fd;
  };
  assert.deepEqual(parseLeadDetails(form({ adminNote: "  โทรกลับพรุ่งนี้ ", assigneeId: "2" })), {
    ok: true,
    value: { adminNote: "โทรกลับพรุ่งนี้", assigneeId: 2 },
  });
  assert.deepEqual(parseLeadDetails(form({ adminNote: "", assigneeId: "" })), { ok: true, value: { adminNote: null, assigneeId: null } });
  assert.deepEqual(parseLeadDetails(form({ assigneeId: "5" })), { ok: true, value: { assigneeId: 5 } }, "a missing note is left unchanged");
  assert.equal(parseLeadDetails(form({ assigneeId: "1; drop" })).ok, false);
  assert.equal(parseLeadDetails(form({ adminNote: "x".repeat(LEAD_NOTE_MAX + 1) })).ok, false);
});
