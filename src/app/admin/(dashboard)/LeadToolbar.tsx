import Link from "next/link";
import { Calendar, ChevronDown, Download, Inbox, Search, X } from "lucide-react";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, leadQueryString, type LeadKind, type LeadParams } from "@/lib/leadList";

const TOPIC_OPTIONS: [string, string][] = [
  ["demo", "นัดสาธิต"],
  ["quote", "ขอใบเสนอราคา"],
  ["general", "สอบถามทั่วไป"],
  ["support", "แจ้งปัญหา/บริการ"],
];

const labelClass = "mb-1 block text-xs font-semibold text-text-2";
const fieldClass =
  "w-full rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40";
const selectClass = `${fieldClass} appearance-none pr-9`;

function hasFilter(params: LeadParams) {
  return Boolean(params.status || params.q || params.assignee !== "all" || params.topic || params.from || params.to);
}

function SelectWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
    </div>
  );
}

/** GET form: search, status, assignee, (topic), date range. Submitting resets to page 1. */
export function LeadToolbar({
  kind,
  basePath,
  params,
  admins,
  searchPlaceholder,
  total,
}: {
  kind: LeadKind;
  basePath: string;
  params: LeadParams;
  admins: { id: number; name: string }[];
  searchPlaceholder: string;
  total: number;
}) {
  // Same filters as the list, without the page: the export covers every matching row.
  const exportQs = leadQueryString(params, { page: undefined });
  const exportHref = `${basePath}/export${exportQs ? `?${exportQs}` : ""}`;
  const exportClass = "inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 text-sm font-semibold";
  return (
    <form method="get" action={basePath} className="mt-6 rounded-xl border border-border bg-surface-0 p-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-0 flex-1 basis-64">
          <label htmlFor="lead-q" className={labelClass}>
            ค้นหา
          </label>
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
            <input
              id="lead-q"
              name="q"
              type="search"
              maxLength={100}
              defaultValue={params.q}
              placeholder={searchPlaceholder}
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
        <div className="min-w-36">
          <label htmlFor="lead-status" className={labelClass}>
            สถานะ
          </label>
          <SelectWrap>
            <select id="lead-status" name="status" defaultValue={params.status ?? ""} className={selectClass}>
              <option value="">ทั้งหมด</option>
              {LEAD_STATUSES[kind].map((s) => (
                <option key={s} value={s}>
                  {LEAD_STATUS_LABELS[s] ?? s}
                </option>
              ))}
            </select>
          </SelectWrap>
        </div>
        <div className="min-w-36">
          <label htmlFor="lead-assignee" className={labelClass}>
            ผู้รับผิดชอบ
          </label>
          <SelectWrap>
            <select id="lead-assignee" name="assignee" defaultValue={String(params.assignee)} className={selectClass}>
              <option value="all">ทุกคน</option>
              <option value="none">ยังไม่มอบหมาย</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </SelectWrap>
        </div>
        {kind === "contact" && (
          <div className="min-w-36">
            <label htmlFor="lead-topic" className={labelClass}>
              หัวข้อ
            </label>
            <SelectWrap>
              <select id="lead-topic" name="topic" defaultValue={params.topic ?? ""} className={selectClass}>
                <option value="">ทั้งหมด</option>
                {TOPIC_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </SelectWrap>
          </div>
        )}
        <div>
          <label htmlFor="lead-from" className={labelClass}>
            ตั้งแต่วันที่
          </label>
          <div className="relative">
            <Calendar aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
            <input id="lead-from" name="from" type="date" defaultValue={params.from ?? ""} className={`${fieldClass} pl-9`} />
          </div>
        </div>
        <div>
          <label htmlFor="lead-to" className={labelClass}>
            ถึงวันที่
          </label>
          <div className="relative">
            <Calendar aria-hidden className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-2" />
            <input id="lead-to" name="to" type="date" defaultValue={params.to ?? ""} className={`${fieldClass} pl-9`} />
          </div>
        </div>
        {hasFilter(params) && (
          <Link href={basePath} className="ml-auto inline-flex items-center gap-1.5 py-2 text-sm text-text-2 hover:text-text-1">
            <X aria-hidden className="size-4" />
            ล้างตัวกรอง
          </Link>
        )}
      </div>
    </form>
  );
}

export function LeadResultBar({ total, page, pageCount }: { total: number; page: number; pageCount: number }) {
  return (
    <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-text-2">
      <p>
        <span className="font-semibold text-text-1">พบ {total.toLocaleString("th-TH")} รายการ</span>
        {total > 0 && ` · หน้า ${page} จาก ${pageCount}`}
      </p>
      {total > 0 && <p className="text-xs">ส่งออก CSV ได้ทุกรายการที่ตรงกับตัวกรอง ไม่ใช่เฉพาะหน้านี้</p>}
    </div>
  );
}

/** Dashed empty state: "no data at all" vs "nothing matches the filter". */
export function LeadEmpty({
  params,
  basePath,
  emptyTitle,
  emptyText,
}: {
  params: LeadParams;
  basePath: string;
  emptyTitle: string;
  emptyText: string;
}) {
  const filtered = hasFilter(params);
  return (
    <div className="mt-3 flex flex-col items-center rounded-xl border border-dashed border-border-strong px-4 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-surface-2 text-text-2">
        <Inbox aria-hidden className="size-6" />
      </span>
      <p className="mt-4 font-semibold text-text-1">{filtered ? "ไม่พบรายการที่ตรงกับตัวกรอง" : emptyTitle}</p>
      <p className="mt-1 text-sm text-text-2">
        {filtered ? "ลองเปลี่ยนคำค้น สถานะ หรือช่วงวันที่ หรือล้างตัวกรองเพื่อดูทั้งหมด" : emptyText}
      </p>
      {filtered && (
        <Link
          href={basePath}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-4 py-2 text-sm text-text-1 hover:bg-surface-2"
        >
          <X aria-hidden className="size-4" />
          ล้างตัวกรอง
        </Link>
      )}
    </div>
  );
}
