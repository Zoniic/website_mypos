import { prisma } from "@/lib/prisma";
import { recordAudit, retentionCutoff, type AuditChange, type AuditClient } from "@/lib/audit";
import { ENTITIES, isRestorableChange, splitContentId } from "@/lib/auditRegistry";
import { actorOf } from "@/lib/auditLog";
import { hasEmoji } from "@/lib/emoji";

type TranslationDelegate = {
  findFirst(args: Record<string, unknown>): Promise<{ id: number; [key: string]: unknown } | null>;
  update(args: Record<string, unknown>): Promise<unknown>;
};

class RestoreError extends Error {}

export const RESTORED = "restored";

/**
 * Puts an old text value back (decisions R3a: only Page Content and
 * translated text fields). The change and its `restore` history row are
 * written in one transaction, so a restore is always recorded. The caller
 * must have checked that the user is an owner. Returns `RESTORED` or a Thai
 * message saying why nothing was changed.
 */
export async function restoreChange(
  admin: { userId: number; email: string; name: string },
  auditId: number,
  changeIndex: number,
): Promise<string> {
  if (!Number.isInteger(auditId) || !Number.isInteger(changeIndex) || changeIndex < 0) return "ไม่พบรายการนี้";
  const row = await prisma.auditLog.findFirst({ where: { id: auditId, createdAt: { gte: retentionCutoff() } } });
  if (!row) return "ไม่พบรายการนี้ หรือเก็บเกิน 1 ปีแล้ว";
  const changes = Array.isArray(row.changes) ? (row.changes as unknown as AuditChange[]) : [];
  const change = changes[changeIndex];
  if (!change || !isRestorableChange(row, change) || typeof change.before !== "string" || !change.locale) {
    return "รายการนี้กู้คืนไม่ได้ กู้คืนได้เฉพาะข้อความ";
  }
  const target = change.before;
  if (hasEmoji(target)) return "ค่าเดิมมีอีโมจิ ซึ่งเว็บนี้ไม่ใช้ กู้คืนไม่ได้";
  const trimmed = target.trim();
  if (row.entityType === "PageContent" && (trimmed.startsWith("[") || trimmed.startsWith("{"))) {
    try {
      JSON.parse(trimmed);
    } catch {
      return "ค่าเดิมเป็นรายการที่รูปแบบไม่ถูกต้อง กู้คืนไม่ได้";
    }
  }
  const locale = change.locale;

  try {
    await prisma.$transaction(async (tx) => {
      let current: string;
      if (row.entityType === "PageContent") {
        const id = splitContentId(row.entityId);
        if (!id) throw new RestoreError("ไม่พบข้อความนี้แล้ว");
        const where = { namespace_key_locale: { namespace: id.namespace, key: id.key, locale } };
        const found = await tx.pageContent.findUnique({ where });
        if (!found) throw new RestoreError("ไม่พบข้อความนี้แล้ว");
        current = found.value;
        if (current === target) throw new RestoreError("ค่าปัจจุบันเหมือนกับค่าเดิมอยู่แล้ว");
        await tx.pageContent.update({ where, data: { value: target } });
      } else {
        const translations = ENTITIES[row.entityType]?.translations;
        const parentId = Number(row.entityId);
        if (!translations || !Number.isInteger(parentId)) throw new RestoreError("รายการนี้กู้คืนไม่ได้");
        const delegate = (tx as unknown as Record<string, TranslationDelegate>)[translations.model];
        const found = await delegate.findFirst({ where: { [translations.fk]: parentId, locale } });
        if (!found) throw new RestoreError("ไม่พบรายการนี้แล้ว (อาจถูกลบไปแล้ว) กู้คืนไม่ได้");
        current = String(found[change.field] ?? "");
        if (current === target) throw new RestoreError("ค่าปัจจุบันเหมือนกับค่าเดิมอยู่แล้ว");
        await delegate.update({ where: { id: found.id }, data: { [change.field]: target } });
      }
      await recordAudit(
        tx as unknown as AuditClient,
        {
          actor: actorOf(admin),
          action: "restore",
          entityType: row.entityType,
          entityId: row.entityId,
          entityLabel: row.entityLabel,
          restoredFromId: row.id,
          detail: `กู้คืนค่าเดิม (${locale})`,
          changes: [{ field: change.field, locale, before: current, after: target }],
        },
        { transactional: true },
      );
    });
  } catch (error) {
    if (error instanceof RestoreError) return error.message;
    throw error;
  }
  return RESTORED;
}
