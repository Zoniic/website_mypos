import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Check, ChevronLeft, ExternalLink, User } from "lucide-react";
import { getAdminContext } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { retentionCutoff, type AuditChange } from "@/lib/audit";
import { AUDIT_LOCALES, ENTITIES, LOCALE_LABELS, entityLabel, isRestorableChange } from "@/lib/auditRegistry";
import { actionLabel, fieldText, formatThaiDateTime } from "@/lib/historyList";
import { OwnerOnly } from "../../OwnerOnly";
import { RestoreButton } from "../RestoreButton";

const show = (value: string | number | boolean | null) => (value === null ? null : String(value));

function Value({ tone, value }: { tone: "before" | "after"; value: string | number | boolean | null }) {
  const text = show(value);
  const box = tone === "before" ? "border-error/30 bg-error/10" : "border-success/30 bg-success/10";
  const label = tone === "before" ? "text-error" : "text-success-strong";
  return (
    <div className={`rounded-lg border p-3 ${box}`}>
      <p className={`text-xs font-semibold ${label}`}>{tone === "before" ? "ก่อน" : "หลัง"}</p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-text-1">
        {text === null ? <span className="text-text-2">ไม่มีค่า</span> : text === "" ? <span className="text-text-2">ว่าง</span> : text}
      </p>
    </div>
  );
}

export default async function HistoryDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { role } = await getAdminContext();
  if (role !== "owner") return <OwnerOnly />;

  const { id: rawId } = await params;
  const id = /^\d{1,9}$/.test(rawId) ? Number(rawId) : 0;
  const row = id ? await prisma.auditLog.findFirst({ where: { id, createdAt: { gte: retentionCutoff() } } }) : null;
  if (!row) notFound();

  const restoredLocale = (await searchParams).restored;
  const changes = Array.isArray(row.changes) ? (row.changes as unknown as AuditChange[]) : [];
  const restores = await prisma.auditLog.findMany({ where: { restoredFromId: row.id }, select: { changes: true } });
  const restoredKeys = new Set(
    restores.flatMap((r) => (Array.isArray(r.changes) ? (r.changes as unknown as AuditChange[]) : []).map((c) => `${c.field}|${c.locale ?? ""}`)),
  );
  const origin = row.restoredFromId
    ? await prisma.auditLog.findFirst({ where: { id: row.restoredFromId }, select: { id: true } })
    : null;
  const config = ENTITIES[row.entityType];
  const link = config?.href(row.entityId) ?? null;

  const indexed = changes.map((change, index) => ({ change, index }));
  const general = indexed.filter((x) => !x.change.locale);
  const hasLocales = indexed.some((x) => x.change.locale);
  const restorable = (c: AuditChange) => isRestorableChange(row, c);

  return (
    <div>
      <Link href="/admin/history" className="inline-flex items-center gap-1 text-sm text-text-2 hover:text-text-1">
        <ChevronLeft aria-hidden className="size-4" />
        กลับไปประวัติการแก้ไข
      </Link>
      <h1 className="mt-2 text-2xl font-bold">
        {actionLabel(row.action)} · {entityLabel(row.entityType)} · {row.entityLabel}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-2">
        <span className="inline-flex items-center gap-1.5 font-semibold text-text-1">
          <User aria-hidden className="size-4 text-text-2" />
          {row.actorName}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Calendar aria-hidden className="size-4" />
          {formatThaiDateTime(row.createdAt)}
        </span>
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold">{actionLabel(row.action)}</span>
        {row.source === "live" && <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs">แก้บนหน้าเว็บ</span>}
        {link && (
          <Link href={link} className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700">
            <ExternalLink aria-hidden className="size-4" />
            เปิดรายการนี้
          </Link>
        )}
      </div>
      {row.detail && <p className="mt-2 text-sm text-text-2">{row.detail}</p>}

      {typeof restoredLocale === "string" && restoredLocale && (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-sm font-semibold text-success-strong">
          <Check aria-hidden className="size-4" />
          กู้คืนค่าเดิม{restoredLocale}แล้ว หน้าเว็บแสดงค่าเดิมทันที และบันทึกเป็นประวัติใหม่แล้ว
        </p>
      )}
      {origin && (
        <p className="mt-4 text-sm text-text-2">
          รายการนี้เป็นการกู้คืนจาก{" "}
          <Link href={`/admin/history/${origin.id}`} className="font-semibold text-primary-600 hover:text-primary-700">
            ประวัติ #{origin.id}
          </Link>
        </p>
      )}
      {changes.length === 0 && <p className="mt-6 text-sm text-text-2">รายการนี้ไม่มีรายละเอียดฟิลด์</p>}

      <div className="mt-4 space-y-4">
        {hasLocales &&
          AUDIT_LOCALES.map((locale) => {
            const items = indexed.filter((x) => x.change.locale === locale);
            if (items.length === 0) {
              return (
                <p key={locale} className="rounded-lg bg-surface-2 px-4 py-3 text-sm text-text-2">
                  {LOCALE_LABELS[locale]} · ไม่มีการเปลี่ยนแปลง
                </p>
              );
            }
            return (
              <section key={locale} className="rounded-xl border border-border bg-surface-0 p-4">
                <h2 className="text-sm font-bold">{LOCALE_LABELS[locale]}</h2>
                <div className="mt-3 space-y-4">
                  {items.map(({ change, index }) => {
                    const done = restoredKeys.has(`${change.field}|${locale}`);
                    return (
                      <div key={index}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-text-2">{fieldText(change.field)}</p>
                          {restorable(change) &&
                            (done ? (
                              <span className="inline-flex items-center gap-1 text-sm font-semibold text-success-strong">
                                <Check aria-hidden className="size-4" />
                                กู้คืนแล้ว
                              </span>
                            ) : (
                              <RestoreButton
                                auditId={row.id}
                                changeIndex={index}
                                localeLabel={LOCALE_LABELS[locale]}
                                fieldLabel={row.entityLabel}
                                preview={String(change.before)}
                              />
                            ))}
                        </div>
                        <div className="mt-2 grid gap-3 sm:grid-cols-2">
                          <Value tone="before" value={change.before} />
                          <Value tone="after" value={change.after} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        {general.length > 0 && (
          <section className="rounded-xl border border-border bg-surface-0 p-4">
            {hasLocales && <h2 className="text-sm font-bold">ข้อมูลทั่วไป</h2>}
            <div className={`${hasLocales ? "mt-3" : ""} space-y-4`}>
              {general.map(({ change, index }) => (
                <div key={index}>
                  <p className="text-xs font-semibold text-text-2">{fieldText(change.field)}</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <Value tone="before" value={change.before} />
                    <Value tone="after" value={change.after} />
                  </div>
                </div>
              ))}
            </div>
            {row.action !== "delete" && general.some((x) => /price|image|url|logo/i.test(x.change.field)) && (
              <p className="mt-3 text-xs text-text-2">ราคา รูปภาพ และลิงก์ดูย้อนหลังได้ แต่กู้คืนจากหน้านี้ไม่ได้ กู้คืนได้เฉพาะข้อความ</p>
            )}
            {row.action === "delete" && (
              <p className="mt-3 text-xs text-text-2">รายการที่ถูกลบดูย้อนหลังได้ แต่กู้คืนจากหน้านี้ไม่ได้</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
