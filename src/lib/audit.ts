/**
 * Change history (AuditLog). Pure helpers plus `recordAudit`, which takes the
 * Prisma client (or a transaction client) as a parameter so it can be unit
 * tested with a fake. No `server-only` import on purpose.
 *
 * Secrets never reach the table: `redact` replaces the value of any key that
 * looks like a password, secret, token, TOTP, backup code or hash.
 */

export const AUDIT_RETENTION_DAYS = 365;
export const AUDIT_MAX_STRING = 20_000;
export const AUDIT_TRUNCATED_MARK = "…[ตัดทอน]";
export const AUDIT_REDACTED = "[ซ่อน]";
const PURGE_INTERVAL_MS = 24 * 60 * 60 * 1000;

export const AUDIT_ACTIONS = [
  "create",
  "update",
  "delete",
  "status_change",
  "restore",
  "login",
  "role_change",
  "password_change",
  "2fa_enable",
  "2fa_disable",
  "2fa_reset",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export type AuditSource = "admin" | "live" | "script";

export type AuditValue = string | number | boolean | null;

export type AuditChange = {
  field: string;
  locale?: string;
  before: AuditValue;
  after: AuditValue;
};

export type AuditActor = { id: number | null; email: string; name: string };

export type AuditEntry = {
  actor: AuditActor;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityLabel: string;
  source?: AuditSource;
  detail?: string | null;
  restoredFromId?: number | null;
  changes?: AuditChange[];
};

/** The slice of the Prisma client this module needs (the real client and a transaction client both fit). */
export type AuditClient = {
  auditLog: {
    create(args: { data: Record<string, unknown> }): Promise<unknown>;
    deleteMany(args: { where: { createdAt: { lt: Date } } }): Promise<{ count: number }>;
  };
};

const SECRET_KEY = /password|secret|token|totp|backup|hash/i;

/** Normalises any value to something the changes column can hold. */
export function toAuditValue(value: unknown): AuditValue {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();
  return JSON.stringify(redact(value));
}

export function truncate(value: AuditValue): AuditValue {
  if (typeof value === "string" && value.length > AUDIT_MAX_STRING) {
    return value.slice(0, AUDIT_MAX_STRING) + AUDIT_TRUNCATED_MARK;
  }
  return value;
}

/** Deep copy with the value of every secret-looking key replaced. Arrays and nested objects are walked. */
export function redact<T>(input: T): T {
  if (Array.isArray(input)) return input.map((item) => redact(item)) as unknown as T;
  if (input instanceof Date) return input;
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      out[key] = SECRET_KEY.test(key) && value !== null && value !== undefined ? AUDIT_REDACTED : redact(value);
    }
    return out as T;
  }
  return input;
}

/**
 * Field-by-field changes between two records, in alphabetical field order.
 * before null: create (every field, before null). after null: delete (every
 * field, after null). Both set: only fields whose value changed. Pass
 * `locale` for translation rows so the entries keep it.
 */
export function diffFields(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined,
  options: { locale?: string } = {},
): AuditChange[] {
  if (!before && !after) return [];
  const keys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])].sort();
  const changes: AuditChange[] = [];
  for (const field of keys) {
    const b = before ? toAuditValue(before[field]) : null;
    const a = after ? toAuditValue(after[field]) : null;
    if (before && after && b === a) continue;
    const change: AuditChange = { field, before: b, after: a };
    if (options.locale) change.locale = options.locale;
    changes.push(change);
  }
  return changes;
}

/** Redacts secret fields and truncates long strings in a list of changes. */
export function sanitizeChanges(changes: AuditChange[]): AuditChange[] {
  return changes.map((change) => {
    const secret = SECRET_KEY.test(change.field);
    const clean = (v: AuditValue): AuditValue => (secret && v !== null ? AUDIT_REDACTED : truncate(v));
    const out: AuditChange = { field: change.field, before: clean(change.before), after: clean(change.after) };
    if (change.locale) out.locale = change.locale;
    return out;
  });
}

/** History older than this is not shown and may be deleted. Exactly 365 days before `now`. */
export function retentionCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - AUDIT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

let lastPurgeAt = 0;

/** Test helper: forget the last purge time. */
export function resetPurgeThrottle(): void {
  lastPurgeAt = 0;
}

/**
 * Deletes history older than the retention period. Runs at most once per 24
 * hours per process unless `force` is set. Returns the number deleted, or
 * null when skipped or failed. Never throws.
 */
export async function purgeExpiredAudit(
  client: AuditClient,
  now: Date = new Date(),
  options: { force?: boolean } = {},
): Promise<number | null> {
  if (!options.force && lastPurgeAt && now.getTime() - lastPurgeAt < PURGE_INTERVAL_MS) return null;
  lastPurgeAt = now.getTime();
  try {
    const result = await client.auditLog.deleteMany({ where: { createdAt: { lt: retentionCutoff(now) } } });
    return result.count;
  } catch {
    console.error("audit purge failed");
    return null;
  }
}

function toRow(entry: AuditEntry, changes: AuditChange[]): Record<string, unknown> {
  return {
    actorId: entry.actor.id,
    actorEmail: entry.actor.email,
    actorName: entry.actor.name,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    entityLabel: truncate(entry.entityLabel) as string,
    source: entry.source ?? "admin",
    detail: entry.detail ?? null,
    restoredFromId: entry.restoredFromId ?? null,
    changes,
  };
}

/**
 * Writes one history row. An update with no changes writes nothing (returns
 * false). Default is best effort: a failure logs only the entity type and
 * action (never values) and does not throw. With `transactional: true` the
 * error is rethrown so the surrounding transaction rolls back; pass the
 * transaction client as `client` in that case.
 */
export async function recordAudit(
  client: AuditClient,
  entry: AuditEntry,
  options: { transactional?: boolean; now?: Date } = {},
): Promise<boolean> {
  const changes = sanitizeChanges(entry.changes ?? []);
  if (entry.action === "update" && changes.length === 0) return false;
  try {
    await client.auditLog.create({ data: toRow(entry, changes) });
  } catch (error) {
    if (options.transactional) throw error;
    console.error(`audit write failed: ${entry.entityType} ${entry.action}`);
    return false;
  }
  if (!options.transactional) void purgeExpiredAudit(client, options.now);
  return true;
}

/**
 * One summary row for a data script run (no per-row diff: the script's JSON
 * backup holds it). Warns only when the table is missing or the write fails.
 */
export async function recordScriptAudit(
  client: AuditClient,
  input: { script: string; rows: number; backupFile?: string | null; host?: string; osUser?: string; action?: AuditAction },
): Promise<boolean> {
  const detail = [
    `สคริปต์ ${input.script}`,
    `${input.rows} แถว`,
    input.backupFile ? `สำรอง ${input.backupFile}` : null,
    input.osUser ? `ผู้ใช้ระบบ ${input.osUser}` : null,
    input.host ? `เครื่อง ${input.host}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  try {
    await client.auditLog.create({
      data: toRow(
        {
          actor: { id: null, email: `script:${input.script}`, name: `script:${input.script}` },
          action: input.action ?? "update",
          entityType: "Script",
          entityId: input.script,
          entityLabel: input.script,
          source: "script",
          detail,
        },
        [],
      ),
    });
    return true;
  } catch {
    console.warn(`audit summary row not written for ${input.script} (table missing?)`);
    return false;
  }
}
