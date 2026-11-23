import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LEAD_PAGE_SIZE, leadQueryString, type LeadParams } from "@/lib/leadList";

const base = "inline-flex items-center gap-1 rounded-lg border px-3.5 py-2 text-sm";
const enabled = `${base} border-border-strong text-text-1 hover:bg-surface-2`;
const disabled = `${base} border-border text-text-2 opacity-60`;

export function LeadPager({
  basePath,
  params,
  page,
  pageCount,
  total,
}: {
  basePath: string;
  params: LeadParams;
  page: number;
  pageCount: number;
  total: number;
}) {
  if (total === 0) return null;
  const from = (page - 1) * LEAD_PAGE_SIZE + 1;
  const to = Math.min(page * LEAD_PAGE_SIZE, total);
  const href = (target: number) => {
    const qs = leadQueryString(params, { page: target });
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <nav aria-label="เปลี่ยนหน้า" className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-text-2">
        แสดง {from.toLocaleString("th-TH")}–{to.toLocaleString("th-TH")} จาก {total.toLocaleString("th-TH")} รายการ
      </p>
      <div className="flex items-center gap-2 text-sm">
        {page > 1 ? (
          <Link href={href(page - 1)} className={enabled}>
            <ChevronLeft aria-hidden className="size-4" />
            ก่อนหน้า
          </Link>
        ) : (
          <span aria-disabled="true" className={disabled}>
            <ChevronLeft aria-hidden className="size-4" />
            ก่อนหน้า
          </span>
        )}
        <span className="text-text-1">
          หน้า {page} / {pageCount}
        </span>
        {page < pageCount ? (
          <Link href={href(page + 1)} className={enabled}>
            ถัดไป
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        ) : (
          <span aria-disabled="true" className={disabled}>
            ถัดไป
            <ChevronRight aria-hidden className="size-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
