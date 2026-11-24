import { prisma } from "@/lib/prisma";
import {
  recordAudit,
  retentionCutoff,
  type AuditAction,
  type AuditActor,
  type AuditChange,
  type AuditClient,
  type AuditSource,
} from "@/lib/audit";
import {
  ENTITIES,
  contentChangesByKey,
  entityAction,
  entityChanges,
  type ContentRow,
  type Snapshot,
} from "@/lib/auditRegistry";

/**
 * Database side of the change history. Actions load a snapshot of a record
 * before the write, write, then call `auditEntity` with the before and after
 * snapshots. The diff, redaction and "no change, no row" rules live in
 * `audit.ts` and `auditRegistry.ts`.
 */

type ActingUser = { userId: number; email: string; name: string };
type Db = typeof prisma;
type Delegate = { findUnique(args: Record<string, unknown>): Promise<Snapshot | null> };

export type AuditOptions = {
  source?: AuditSource;
  detail?: string | null;
  action?: AuditAction;
  /** A transaction client. Pair with `transactional: true` so a failed history write rolls the change back. */
  client?: Db;
  transactional?: boolean;
};

export const actorOf = (user: ActingUser): AuditActor => ({ id: user.userId, email: user.email, name: user.name });

const asAuditClient = (db: Db | undefined) => (db ?? prisma) as unknown as AuditClient;

/** The record as it is now (with translations and slug relations), or null when it does not exist. */
export async function loadSnapshot(type: string, id: number, db: Db = prisma): Promise<Snapshot | null> {
  const config = ENTITIES[type];
  if (!config?.model) throw new Error(`No snapshot for ${type}`);
  const delegate = (db as unknown as Record<string, Delegate>)[config.model];
  const include: Record<string, unknown> = {};
  if (config.translations) include[config.translations.relation] = true;
  for (const relation of config.slugRelations ?? []) include[relation] = { select: { slug: true } };
  const args: Record<string, unknown> = { where: { id } };
  if (config.select) args.select = config.select;
  else if (Object.keys(include).length) args.include = include;
  return delegate.findUnique(args);
}

/** Records one create, edit, status change or delete of a record found by id. */
export async function auditEntity(
  user: ActingUser,
  type: string,
  before: Snapshot | null,
  after: Snapshot | null,
  options: AuditOptions = {},
): Promise<boolean> {
  const config = ENTITIES[type];
  const row = after ?? before;
  if (!config || !row) return false;
  const changes = entityChanges(config, before, after);
  return recordAudit(
    asAuditClient(options.client),
    {
      actor: actorOf(user),
      action: options.action ?? entityAction(config, before, after, changes),
      entityType: type,
      entityId: String(row.id),
      entityLabel: config.labelOf(row),
      source: options.source,
      detail: options.detail,
      changes,
    },
    { transactional: options.transactional },
  );
}

/** One key-value record (a site setting or a photo slot): `before` and `after` are the stored text, null = absent. */
export async function auditKeyed(
  user: ActingUser,
  type: "SiteSetting" | "SiteImage",
  key: string,
  before: string | null,
  after: string | null,
  options: AuditOptions = {},
): Promise<boolean> {
  if (before === after) return false;
  const field = type === "SiteImage" ? "url" : "value";
  return recordAudit(
    asAuditClient(options.client),
    {
      actor: actorOf(user),
      action: options.action ?? (before === null ? "create" : after === null ? "delete" : "update"),
      entityType: type,
      entityId: key,
      entityLabel: key,
      source: options.source,
      detail: options.detail,
      changes: [{ field, before, after }],
    },
    { transactional: options.transactional },
  );
}

/** Settings saved together: one row per key whose value changed. A key saved empty for the first time is not a change. */
export async function auditSettings(
  user: ActingUser,
  before: Record<string, string | undefined>,
  after: Record<string, string>,
  options: AuditOptions = {},
): Promise<void> {
  for (const [key, value] of Object.entries(after)) {
    const old = before[key];
    if (old === undefined && value === "") continue;
    await auditKeyed(user, "SiteSetting", key, old ?? null, value, options);
  }
}

/** Current stored text of some settings, keyed by setting key. */
export async function readSettingValues(keys: string[]): Promise<Record<string, string | undefined>> {
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: keys } } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/** Page Content rows of a namespace (optionally one key) in the shape the diff expects. */
export async function loadContentRows(namespace: string, key?: string): Promise<ContentRow[]> {
  const rows = await prisma.pageContent.findMany({ where: { namespace, ...(key ? { key } : {}) } });
  return rows.map((r) => ({ key: r.key, locale: r.locale, value: r.value }));
}

/** Records Page Content edits: one row per changed key with every changed language inside it. */
export async function auditContent(
  user: ActingUser,
  namespace: string,
  existing: ContentRow[],
  updates: ContentRow[],
  options: AuditOptions = {},
): Promise<void> {
  const client = asAuditClient(options.client);
  for (const change of contentChangesByKey(existing, updates)) {
    await recordAudit(
      client,
      {
        actor: actorOf(user),
        action: change.action,
        entityType: "PageContent",
        entityId: `${namespace}.${change.key}`,
        entityLabel: `${namespace}.${change.key}`,
        source: options.source,
        detail: options.detail,
        changes: change.changes as AuditChange[],
      },
      { transactional: options.transactional },
    );
  }
}

/** One summary row for a multi-record action (for example copying or removing a page's text). */
export async function auditNote(
  user: ActingUser,
  type: string,
  entityId: string,
  action: AuditAction,
  detail: string,
  options: AuditOptions = {},
): Promise<boolean> {
  return recordAudit(
    asAuditClient(options.client),
    {
      actor: actorOf(user),
      action,
      entityType: type,
      entityId,
      entityLabel: entityId,
      source: options.source,
      detail,
    },
    { transactional: options.transactional },
  );
}

/** Password change: the history only says it happened, never the password or hash. */
export async function auditPasswordChange(
  user: ActingUser,
  targetId: number,
  targetEmail: string,
  options: AuditOptions = {},
): Promise<boolean> {
  return recordAudit(
    asAuditClient(options.client),
    {
      actor: actorOf(user),
      action: "password_change",
      entityType: "AdminUser",
      entityId: String(targetId),
      entityLabel: targetEmail,
      source: options.source,
      changes: [{ field: "password", before: null, after: "[ซ่อน]" }],
    },
    { transactional: options.transactional },
  );
}

/** A successful sign-in. `detail` can say how (for example a backup code). */
export async function auditLogin(user: ActingUser, detail?: string): Promise<boolean> {
  return recordAudit(asAuditClient(undefined), {
    actor: actorOf(user),
    action: "login",
    entityType: "AdminUser",
    entityId: String(user.userId),
    entityLabel: user.email,
    detail: detail ?? null,
    changes: [],
  });
}

/** Number of history rows per Page Content key of a namespace, within the retention period. */
export async function pageContentHistoryCounts(namespace: string): Promise<Record<string, number>> {
  const prefix = `${namespace}.`;
  const groups = await prisma.auditLog.groupBy({
    by: ["entityId"],
    where: { entityType: "PageContent", entityId: { startsWith: prefix }, createdAt: { gte: retentionCutoff() } },
    _count: { _all: true },
  });
  return Object.fromEntries(groups.map((g) => [g.entityId.slice(prefix.length), g._count._all]));
}
