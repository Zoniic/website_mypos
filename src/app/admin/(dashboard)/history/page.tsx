import Link from "next/link";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, ChevronRight as GoIcon, Download, Inbox, Search, User, X } from "lucide-react";
import { getAdminContext } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { ACTION_LABELS, ENTITY_TYPES, entityLabel } from "@/lib/auditRegistry";

import { retentionCutoff, type AuditChange } from "@/lib/audit";
import {
  HISTORY_PAGE_SIZE,
  actionLabel,
  formatThaiDateTime,
  hasHistoryFilter,
  historyQueryString,
  historyWhere,
  parseHistoryParams,
  summarizeChange,
} from "@/lib/historyList";
import { OwnerOnly } from "../OwnerOnly";

const basePath = "/admin/history";
const labelClass = "mb-1 block text-xs font-semibold text-text-2";
const fieldClass =
  "w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40";
const selectClass = `${fieldClass} appearance-none pr-9`;

const badgeClass: Record<string, string> = {
  create: "bg-success/10 text-success-strong",
  delete: "bg-error/10 text-error",
  status_change: "bg-warning/15 text-warning",
  restore: "bg-primary-50 text-primary-700",
};

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
    </div>
  );
}

export default async function AdminHistoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { role } = await getAdminContext();
  if (role !== "owner") return <OwnerOnly />;

  const params = parseHistoryParams(await searchParams);
  const where = historyWhere(params);
  const total = await prisma.auditLog.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / HISTORY_PAGE_SIZE));
  const page = Math.min(params.page, pageCount);
  const [rows, actors] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * HISTORY_PAGE_SIZE,
      take: HISTORY_PAGE_SIZE,
    }),
    prisma.auditLog.findMany({
      where: { createdAt: { gte: retentionCutoff() }, actorId: { not: null } },
      distinct: ["actorId"],
      select: { actorId: true, actorName: true },
      orderBy: { actorName: "asc" },
    }),
  ]);

  const exportQs = historyQueryString(params, { page: undefined });
  const exportHref = `${basePath}/export${exportQs ? `?${exportQs}` : ""}`;
  const exportClass = "inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-semibold";
  const pageHref = (target: number) => {
    const qs = historyQueryString(params, { page: target });
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const from = (page - 1) * HISTORY_PAGE_SIZE + 1;
  const to = Math.min(page * HISTORY_PAGE_SIZE, total);
  const pagerBase = "inline-flex items-center gap-1 rounded-lg border px-3.5 py-2 text-sm";

  return (
    <div>
      <h1 className="text-2xl font-bold">ประวัติการแก้ไข</h1>
      <p className="mt-1 text-sm text-text-2">ใครทำอะไร กับข้อมูลอะไร เมื่อไร บันทึกอัตโนมัติทุกครั้งที่กดบันทึกหรือลบในหลังบ้าน</p>

      <form method="get" action={basePath} className="mt-6 rounded-xl border border-border bg-surface-0 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-0 flex-1 basis-64">
            <label htmlFor="history-q" className={labelClass}>
              ค้นหา
            </label>
            <div className="relative">
              <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
              <input
                id="history-q"
                name="q"
                type="search"
                maxLength={100}
                defaultValue={params.q}
                placeholder="ชื่อสินค้า ชื่อลูกค้า หรือหัวข้อที่ถูกแก้"
                className={`${fieldClass} pl-9`}
              />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/60"
          >
            ค้นหา
          </button>
          {total > 0 ? (
            <a href={exportHref} className={`${exportClass} text-text-1 hover:bg-surface-2`}>
              <Download aria-hidden className="size-4" />
              ส่งออก CSV
            </a>
          ) : (
            <span aria-disabled="true" className={`${exportClass} border-border text-text-2 opacity-60`}>
              <Download aria-hidden className="size-4" />
              ส่งออก CSV
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-40">
            <label htmlFor="history-user" className={labelClass}>
              ผู้ใช้
            </label>
            <SelectWrap>
              <select id="history-user" name="user" defaultValue={params.user ? String(params.user) : ""} className={selectClass}>
                <option value="">ทุกคน</option>
                {actors.map((a) => (
                  <option key={a.actorId} value={a.actorId ?? ""}>
                    {a.actorName}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </div>
          <div className="min-w-40">
            <label htmlFor="history-type" className={labelClass}>
              ประเภทข้อมูล
            </label>
            <SelectWrap>
              <select id="history-type" name="type" defaultValue={params.type ?? ""} className={selectClass}>
                <option value="">ทั้งหมด</option>
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {entityLabel(t)}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </div>
          <div className="min-w-40">
            <label htmlFor="history-action" className={labelClass}>
              การกระทำ
            </label>
            <SelectWrap>
              <select id="history-action" name="action" defaultValue={params.action ?? ""} className={selectClass}>
                <option value="">ทั้งหมด</option>
                {Object.entries(ACTION_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </div>
          <div>
            <label htmlFor="history-from" className={labelClass}>
              ตั้งแต่วันที่
            </label>
            <div className="relative">
              <Calendar aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
              <input id="history-from" name="from" type="date" defaultValue={params.from ?? ""} className={`${fieldClass} pl-9`} />
            </div>
          </div>
          <div>
            <label htmlFor="history-to" className={labelClass}>
              ถึงวันที่
            </label>
            <div className="relative">
              <Calendar aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
              <input id="history-to" name="to" type="date" defaultValue={params.to ?? ""} className={`${fieldClass} pl-9`} />
            </div>
          </div>
          {hasHistoryFilter(params) && (
            <Link href={basePath} className="ml-auto inline-flex items-center gap-1.5 py-2 text-sm text-text-2 hover:text-text-1">
              <X aria-hidden className="size-4" />
              ล้างตัวกรอง
            </Link>
          )}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-text-2">
        <p>
          <span className="font-semibold text-text-1">พบ {total.toLocaleString("th-TH")} รายการ</span>
          {total > 0 && ` · หน้า ${page} จาก ${pageCount}`}
        </p>
        <p className="text-xs">เก็บประวัติย้อนหลัง 1 ปี รายการที่เก่ากว่านั้นถูกลบอัตโนมัติ</p>
      </div>

      {rows.length === 0 ? (
        <div className="mt-3 flex flex-col items-center rounded-xl border border-dashed border-border-strong px-4 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-surface-2 text-text-2">
            <Inbox aria-hidden className="size-6" />
          </span>
          <p className="mt-4 font-semibold text-text-1">{hasHistoryFilter(params) ? "ไม่พบรายการที่ตรงกับตัวกรอง" : "ยังไม่มีประวัติ"}</p>
          <p className="mt-1 text-sm text-text-2">
            {hasHistoryFilter(params)
              ? "ลองเปลี่ยนคำค้นหรือช่วงวันที่ หรือล้างตัวกรองเพื่อดูทั้งหมด"
              : "ประวัติเริ่มเก็บตั้งแต่วันที่เปิดใช้ระบบนี้ การแก้ไขครั้งต่อไปจะแสดงที่นี่"}
          </p>
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface-0">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-text-2">
                <th scope="col" className="px-4 py-3 font-semibold">เวลา</th>
                <th scope="col" className="px-4 py-3 font-semibold">ผู้ใช้</th>
                <th scope="col" className="px-4 py-3 font-semibold">การกระทำ</th>
                <th scope="col" className="px-4 py-3 font-semibold">รายการ</th>
                <th scope="col" className="px-4 py-3"><span className="sr-only">รายละเอียด</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const changes = Array.isArray(row.changes) ? (row.changes as unknown as AuditChange[]) : [];
                const showLink = changes.length > 0 && row.action !== "status_change";
                return (
                  <tr key={row.id} className="border-b border-border last:border-b-0">
                    <td className="whitespace-nowrap px-4 py-3 text-text-2">{formatThaiDateTime(row.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 text-text-1">
                        <User aria-hidden className="size-4 text-text-2" />
                        {row.actorName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeClass[row.action] ?? "bg-surface-2 text-text-2"}`}>
                        {actionLabel(row.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-text-2">{entityLabel(row.entityType)}</p>
                      <p className="text-text-1">{summarizeChange({ ...row, changes })}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {showLink && (
                        <Link href={`${basePath}/${row.id}`} className="inline-flex items-center gap-1 font-semibold text-primary-600 hover:text-primary-700">
                          ดูการเปลี่ยนแปลง
                          <GoIcon aria-hidden className="size-4" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <nav aria-label="เปลี่ยนหน้า" className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-2">
            แสดง {from.toLocaleString("th-TH")}–{to.toLocaleString("th-TH")} จาก {total.toLocaleString("th-TH")} รายการ
          </p>
          <div className="flex items-center gap-2 text-sm">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className={`${pagerBase} border-border-strong text-text-1 hover:bg-surface-2`}>
                <ChevronLeft aria-hidden className="size-4" />
                ก่อนหน้า
              </Link>
            ) : (
              <span aria-disabled="true" className={`${pagerBase} border-border text-text-2 opacity-60`}>
                <ChevronLeft aria-hidden className="size-4" />
                ก่อนหน้า
              </span>
            )}
            <span className="text-text-1">
              หน้า {page} / {pageCount}
            </span>
            {page < pageCount ? (
              <Link href={pageHref(page + 1)} className={`${pagerBase} border-border-strong text-text-1 hover:bg-surface-2`}>
                ถัดไป
                <ChevronRight aria-hidden className="size-4" />
              </Link>
            ) : (
              <span aria-disabled="true" className={`${pagerBase} border-border text-text-2 opacity-60`}>
                ถัดไป
                <ChevronRight aria-hidden className="size-4" />
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
