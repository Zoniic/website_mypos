"use server";

import { requireOwner } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { retentionCutoff, type AuditChange } from "@/lib/audit";
import { RESTORED, restoreChange } from "@/lib/auditRestore";
import { revalidatePublicSite } from "@/lib/siteCache";

// Every action here is owner-only (decisions R1): requireOwner() reads the
// role from the database on each call, so an editor posting to these
// endpoints directly is refused.

const LOCALES = ["th", "en", "zh"] as const;

export type FieldVersion = {
  value: string;
  /** ISO time the value was saved; null for the value before history began or the live value. */
  at: string | null;
  by: string | null;
  current: boolean;
  initial: boolean;
};
export type FieldHistory = Record<(typeof LOCALES)[number], FieldVersion[]>;

/**
 * Puts an old text value back. Only Page Content and translated text fields
 * qualify (R3a); the restore is recorded in the history in the same
 * transaction (see lib/auditRestore).
 */
export async function restoreAuditChange(auditId: number, changeIndex: number): Promise<string> {
  const admin = await requireOwner();
  const result = await restoreChange(admin, auditId, changeIndex);
  if (result === RESTORED) {
    revalidatePublicSite();
    return "restored";
  }
  return result;
}
/**
 * Versions of one Page Content field for the "ประวัติ" panel, per language,
 * newest first: the live value, then every earlier value. Last 20 saves
 * within the retention period.
 */
export async function getFieldHistory(namespace: string, key: string): Promise<FieldHistory | null> {
  await requireOwner();
  if (typeof namespace !== "string" || typeof key !== "string" || !namespace || !key) return null;
  const [rows, live] = await Promise.all([
    prisma.auditLog.findMany({
      where: { entityType: "PageContent", entityId: `${namespace}.${key}`, createdAt: { gte: retentionCutoff() } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.pageContent.findMany({ where: { namespace, key } }),
  ]);
  const liveBy = Object.fromEntries(live.map((r) => [r.locale, r.value]));
  const out: FieldHistory = { th: [], en: [], zh: [] };
  for (const locale of LOCALES) {
    const asc = [...rows].reverse().flatMap((r) => {
      const changes = Array.isArray(r.changes) ? (r.changes as unknown as AuditChange[]) : [];
      const c = changes.find((x) => x.field === "value" && x.locale === locale);
      return c ? [{ row: r, change: c }] : [];
    });
    const versions: FieldVersion[] = [];
    const firstBefore = asc[0]?.change.before;
    if (typeof firstBefore === "string") versions.push({ value: firstBefore, at: null, by: null, current: false, initial: true });
    for (const { row, change } of asc) {
      if (typeof change.after === "string") {
        versions.push({ value: change.after, at: row.createdAt.toISOString(), by: row.actorName, current: false, initial: false });
      }
    }
    versions.reverse();
    const liveValue = liveBy[locale];
    if (liveValue !== undefined) {
      if (versions[0] && versions[0].value === liveValue) versions[0].current = true;
      else versions.unshift({ value: liveValue, at: null, by: null, current: true, initial: false });
    }
    out[locale] = versions;
  }
  return out;
}
