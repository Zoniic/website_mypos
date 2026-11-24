import { ACTION_LABELS, ENTITY_TYPES, LOCALE_LABELS } from "@/lib/auditRegistry";
import { AUDIT_ACTIONS, retentionCutoff, type AuditChange } from "@/lib/audit";

/**
 * Query layer of the change history list (H1) and its CSV export. Pure: it
 * builds the Prisma `where` but never talks to the database, so it is unit
 * tested. Every query is bounded to the retention period, so an expired row
 * is never shown even before the purge deletes it.
 */

export const HISTORY_PAGE_SIZE = 25;
export const HISTORY_EXPORT_LIMIT = 20000;
const MAX_QUERY_LENGTH = 100;
const MAX_PAGE = 100000;

export type HistoryParams = {
  q: string;
  /** Admin id (also matches rows of deleted users). */
  user: number | undefined;
  type: string | undefined;
  action: string | undefined;
  /** YYYY-MM-DD, Asia/Bangkok calendar day (inclusive). */
  from: string | undefined;
  to: string | undefined;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string => (Array.isArray(value) ? value[0] : value) ?? "";

function parseDay(value: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : value;
}

/** Parses searchParams. Invalid values fall back to "all"; never throws. */
export function parseHistoryParams(raw: RawParams): HistoryParams {
  const user = first(raw.user);
  const type = first(raw.type);
  const action = first(raw.action);
  const page = first(raw.page);
  return {
    q: first(raw.q).trim().slice(0, MAX_QUERY_LENGTH),
    user: /^\d{1,9}$/.test(user) && Number(user) > 0 ? Number(user) : undefined,
    type: ENTITY_TYPES.includes(type) ? type : undefined,
    action: (AUDIT_ACTIONS as readonly string[]).includes(action) ? action : undefined,
    from: parseDay(first(raw.from)),
    to: parseDay(first(raw.to)),
    page: /^\d{1,6}$/.test(page) ? Math.min(Math.max(Number(page), 1), MAX_PAGE) : 1,
  };
}

export function historyQueryString(params: HistoryParams, overrides: Partial<Record<keyof HistoryParams, string | number | undefined>> = {}): string {
  const merged: Record<string, string | number | undefined> = {
    q: params.q || undefined,
    user: params.user,
    type: params.type,
    action: params.action,
    from: params.from,
    to: params.to,
    page: params.page > 1 ? params.page : undefined,
    ...overrides,
  };
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== "" && !(key === "page" && Number(value) <= 1)) search.set(key, String(value));
  }
  return search.toString();
}

export function hasHistoryFilter(params: HistoryParams): boolean {
  return Boolean(params.q || params.user || params.type || params.action || params.from || params.to);
}

/** Prisma `where` for the filters, always limited to the last 365 days. */
export function historyWhere(params: HistoryParams, now: Date = new Date()) {
  const cutoff = retentionCutoff(now);
  const from = params.from ? new Date(`${params.from}T00:00:00+07:00`) : undefined;
  const to = params.to ? new Date(new Date(`${params.to}T00:00:00+07:00`).getTime() + 24 * 60 * 60 * 1000) : undefined;
  const gte = from && from > cutoff ? from : cutoff;
  return {
    createdAt: { gte, ...(to ? { lt: to } : {}) },
    ...(params.user ? { actorId: params.user } : {}),
    ...(params.type ? { entityType: params.type } : {}),
    ...(params.action ? { action: params.action } : {}),
    ...(params.q
      ? {
          OR: [
            { entityLabel: { contains: params.q, mode: "insensitive" as const } },
            { entityId: { contains: params.q, mode: "insensitive" as const } },
            { actorName: { contains: params.q, mode: "insensitive" as const } },
            { actorEmail: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export function formatThaiDateTime(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  }).format(date);
}

const STATUS_TEXT: Record<string, string> = {
  new: "ใหม่",
  contacted: "ติดต่อแล้ว",
  closed: "ปิดงาน",
  open: "เปิดอยู่",
  in_progress: "กำลังดำเนินการ",
  resolved: "เสร็จแล้ว",
  pending_payment: "รอชำระเงิน",
  paid: "ชำระแล้ว",
  preparing: "กำลังจัดเตรียม",
  shipped: "จัดส่งแล้ว",
  completed: "เสร็จสมบูรณ์",
  cancelled: "ยกเลิก",
};

const FIELD_TEXT: Record<string, string> = {
  value: "ข้อความ",
  url: "รูป",
  name: "ชื่อ",
  title: "หัวข้อ",
  status: "สถานะ",
  assigneeId: "ผู้รับผิดชอบ",
  adminNote: "โน้ต",
  priceFrom: "ราคาเริ่มต้น",
  onlinePrice: "ราคาขายออนไลน์",
  imageUrl: "รูปหลัก",
  galleryUrls: "รูปแกลเลอรี",
  coverImageUrl: "รูปปก",
  logoUrl: "โลโก้",
  slug: "slug",
  email: "อีเมล",
  role: "บทบาท",
  password: "รหัสผ่าน",
  featured: "แนะนำ",
};

export const fieldText = (field: string) => FIELD_TEXT[field] ?? field;

/** One line saying what changed, for the list. */
export function summarizeChange(row: { action: string; entityLabel: string; detail: string | null; changes: AuditChange[] }): string {
  const { action, changes } = row;
  if (action === "status_change") {
    const c = changes.find((x) => x.field === "status");
    if (c) return `${row.entityLabel} · จาก ${STATUS_TEXT[String(c.before)] ?? c.before ?? "-"} เป็น ${STATUS_TEXT[String(c.after)] ?? c.after ?? "-"}`;
  }
  if (action === "login") return row.detail ? `เข้าสู่ระบบ (${row.detail})` : "เข้าสู่ระบบ";
  const fields: string[] = [];
  for (const c of changes) {
    const name = fieldText(c.field);
    if (!fields.includes(name)) fields.push(name);
  }
  const locales = [...new Set(changes.map((c) => c.locale).filter((l): l is string => Boolean(l)))].map((l) => LOCALE_LABELS[l] ?? l);
  const parts = [row.entityLabel];
  if (action === "update" || action === "restore") {
    if (fields.length) parts.push(fields.slice(0, 3).join(", ") + (fields.length > 3 ? ` และอีก ${fields.length - 3}` : ""));
    if (locales.length) parts.push(`(${locales.join(", ")})`);
  } else if (row.detail && changes.length === 0) {
    parts.push(row.detail);
  }
  return parts.join(" · ");
}

export function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}
