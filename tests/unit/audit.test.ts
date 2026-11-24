import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  AUDIT_REDACTED,
  AUDIT_TRUNCATED_MARK,
  diffFields,
  purgeExpiredAudit,
  recordAudit,
  recordScriptAudit,
  redact,
  resetPurgeThrottle,
  retentionCutoff,
  sanitizeChanges,
  type AuditClient,
  type AuditEntry,
} from "../../src/lib/audit";

beforeEach(() => resetPurgeThrottle());

test("create lists every field with before null; delete lists every field with after null", () => {
  const record = { name: "A", price: 10, active: true, note: null };
  assert.deepEqual(diffFields(null, record), [
    { field: "active", before: null, after: true },
    { field: "name", before: null, after: "A" },
    { field: "note", before: null, after: null },
    { field: "price", before: null, after: 10 },
  ]);
  assert.deepEqual(
    diffFields(record, null).map((c) => [c.field, c.before, c.after]),
    [
      ["active", true, null],
      ["name", "A", null],
      ["note", null, null],
      ["price", 10, null],
    ],
  );
});

test("update lists only changed fields; no change gives an empty list", () => {
  assert.deepEqual(diffFields({ a: 1, b: "x" }, { a: 1, b: "y" }), [{ field: "b", before: "x", after: "y" }]);
  assert.deepEqual(diffFields({ a: 1 }, { a: 1 }), []);
  assert.deepEqual(diffFields(null, null), []);
});

test("locale is kept; Date, boolean, number and null are handled; empty string differs from null", () => {
  const d1 = new Date("2026-01-01T00:00:00.000Z");
  const changes = diffFields(
    { title: "ก", at: d1, on: false, n: 1, s: "" },
    { title: "ข", at: new Date("2026-02-01T00:00:00.000Z"), on: true, n: 2, s: null },
    { locale: "th" },
  );
  assert.deepEqual(changes, [
    { field: "at", before: "2026-01-01T00:00:00.000Z", after: "2026-02-01T00:00:00.000Z", locale: "th" },
    { field: "n", before: 1, after: 2, locale: "th" },
    { field: "on", before: false, after: true, locale: "th" },
    { field: "s", before: "", after: null, locale: "th" },
    { field: "title", before: "ก", after: "ข", locale: "th" },
  ]);
  assert.deepEqual(diffFields({ d: d1 }, { d: new Date(d1) }), []);
});

test("field order is stable regardless of key order", () => {
  const a = diffFields({ b: 1, a: 1 }, { a: 2, b: 2 });
  const b = diffFields({ a: 1, b: 1 }, { b: 2, a: 2 });
  assert.deepEqual(a, b);
  assert.deepEqual(a.map((c) => c.field), ["a", "b"]);
});

test("redact replaces secret-looking keys, nested too, and the raw value appears nowhere", () => {
  const input = {
    name: "Somchai",
    passwordHash: "RAW-HASH-1",
    totpSecretEnc: "RAW-TOTP-2",
    nested: { codeHash: "RAW-CODE-3", list: [{ token: "RAW-TOKEN-4" }], ok: "visible" },
    apiSecret: "RAW-API-5",
  };
  const out = redact(input);
  const text = JSON.stringify(out);
  for (const raw of ["RAW-HASH-1", "RAW-TOTP-2", "RAW-CODE-3", "RAW-TOKEN-4", "RAW-API-5"]) {
    assert.ok(!text.includes(raw), raw);
  }
  assert.equal(out.passwordHash, AUDIT_REDACTED);
  assert.equal(out.nested.ok, "visible");
  assert.equal(out.name, "Somchai");
  assert.equal(input.passwordHash, "RAW-HASH-1", "input is not mutated");
});

test("diff of a record with secret keys never exposes the value", () => {
  const changes = sanitizeChanges(diffFields({ passwordHash: "old-h" }, { passwordHash: "new-h" }));
  assert.deepEqual(changes, [{ field: "passwordHash", before: AUDIT_REDACTED, after: AUDIT_REDACTED }]);
  const nested = diffFields({ cfg: { token: "t1" } }, { cfg: { token: "t2" } });
  assert.ok(!JSON.stringify(nested).includes("t1") && !JSON.stringify(nested).includes("t2"));
  assert.equal(nested.length, 0, "both sides redact to the same text, so no change is listed");
});

test("strings over 20 000 characters are cut with a marker", () => {
  const long = "x".repeat(25_000);
  const [change] = sanitizeChanges([{ field: "body", before: null, after: long }]);
  const after = change.after as string;
  assert.ok(after.endsWith(AUDIT_TRUNCATED_MARK));
  assert.equal(after.length, 20_000 + AUDIT_TRUNCATED_MARK.length);
  assert.equal(sanitizeChanges([{ field: "b", before: null, after: "short" }])[0].after, "short");
});

test("retentionCutoff is exactly 365 days earlier", () => {
  const now = new Date("2026-11-24T10:00:00.000Z");
  assert.equal(now.getTime() - retentionCutoff(now).getTime(), 365 * 24 * 60 * 60 * 1000);
});

type Calls = { created: Array<Record<string, unknown>>; deleteWhere: unknown[] };

function fakeClient(options: { failCreate?: boolean; failDelete?: boolean } = {}): { client: AuditClient; calls: Calls } {
  const calls: Calls = { created: [], deleteWhere: [] };
  const client: AuditClient = {
    auditLog: {
      async create({ data }) {
        if (options.failCreate) throw new Error("db down: secret-value-123");
        calls.created.push(data);
        return {};
      },
      async deleteMany({ where }) {
        if (options.failDelete) throw new Error("boom");
        calls.deleteWhere.push(where);
        return { count: 3 };
      },
    },
  };
  return { client, calls };
}

const entry: AuditEntry = {
  actor: { id: 1, email: "a@x.th", name: "A" },
  action: "update",
  entityType: "Product",
  entityId: "5",
  entityLabel: "POS X",
  changes: [{ field: "name", before: "a", after: "b" }],
};

test("recordAudit writes a row; an update with no changes writes nothing", async () => {
  const { client, calls } = fakeClient();
  assert.equal(await recordAudit(client, entry, { transactional: true }), true);
  assert.equal(calls.created.length, 1);
  assert.equal(calls.created[0].source, "admin");
  assert.equal(await recordAudit(client, { ...entry, changes: [] }, { transactional: true }), false);
  assert.equal(calls.created.length, 1);
  assert.equal(await recordAudit(client, { ...entry, action: "login", changes: [] }, { transactional: true }), true);
});

test("best effort: a failing client resolves and logs only entity type and action", async () => {
  const { client } = fakeClient({ failCreate: true });
  const logged: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => logged.push(args.join(" "));
  try {
    assert.equal(await recordAudit(client, entry), false);
  } finally {
    console.error = original;
  }
  assert.deepEqual(logged, ["audit write failed: Product update"]);
  assert.ok(!logged.join().includes("secret-value-123"));
});

test("transactional: a failing client rethrows", async () => {
  const { client } = fakeClient({ failCreate: true });
  await assert.rejects(() => recordAudit(client, entry, { transactional: true }));
});

test("purgeExpiredAudit deletes rows older than the cutoff and runs once per 24 h per process", async () => {
  const { client, calls } = fakeClient();
  const now = new Date("2026-11-24T10:00:00.000Z");
  assert.equal(await purgeExpiredAudit(client, now), 3);
  assert.deepEqual(calls.deleteWhere[0], { createdAt: { lt: retentionCutoff(now) } });
  assert.equal(await purgeExpiredAudit(client, new Date(now.getTime() + 60_000)), null);
  assert.equal(calls.deleteWhere.length, 1);
  assert.equal(await purgeExpiredAudit(client, new Date(now.getTime() + 25 * 3600_000)), 3);
  assert.equal(await purgeExpiredAudit(client, new Date(now.getTime() + 25 * 3600_000), { force: true }), 3);
  assert.equal(calls.deleteWhere.length, 3);
});

test("purge failure does not throw", async () => {
  const { client } = fakeClient({ failDelete: true });
  const original = console.error;
  console.error = () => {};
  try {
    assert.equal(await purgeExpiredAudit(client, new Date(), { force: true }), null);
  } finally {
    console.error = original;
  }
});

test("recordScriptAudit writes a script row and only warns when the table is missing", async () => {
  const { client, calls } = fakeClient();
  assert.equal(await recordScriptAudit(client, { script: "strip-emoji", rows: 4, backupFile: "b.json" }), true);
  assert.equal(calls.created[0].source, "script");
  assert.equal(calls.created[0].actorId, null);
  assert.deepEqual(calls.created[0].changes, []);
  const failing = fakeClient({ failCreate: true });
  const original = console.warn;
  console.warn = () => {};
  try {
    assert.equal(await recordScriptAudit(failing.client, { script: "x", rows: 1 }), false);
  } finally {
    console.warn = original;
  }
});
