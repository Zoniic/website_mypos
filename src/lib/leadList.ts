import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auditEntity, loadSnapshot } from "@/lib/auditLog";

/**
 * Shared query layer for the admin lead lists (contact messages, quote
 * requests, warranty claims): parsed searchParams, `where` builders,
 * pagination and the detail (note + assignee) save used by the actions.
 * All filtering goes through Prisma's query builder, never raw SQL.
 */

export type LeadKind = "contact" | "quote" | "warranty";

export const LEAD_STATUSES: Record<LeadKind, readonly string[]> = {
  contact: ["new", "contacted", "closed"],
  quote: ["new", "contacted", "closed"],
  warranty: ["open", "in_progress", "resolved"],
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  new: "ใหม่",
  contacted: "ติดต่อแล้ว",
  closed: "ปิดงาน",
  open: "เปิดอยู่",
  in_progress: "กำลังดำเนินการ",
  resolved: "เสร็จแล้ว",
};

export const CONTACT_TOPICS = ["demo", "quote", "general", "support"] as const;

export const LEAD_PAGE_SIZE = 25;
export const LEAD_EXPORT_LIMIT = 20000;
export const LEAD_NOTE_MAX = 2000;
const MAX_QUERY_LENGTH = 100;
const MAX_PAGE = 100000;

export type LeadParams = {
  status: string | undefined;
  q: string;
  /** "all" | "none" | an AdminUser id. */
  assignee: "all" | "none" | number;
  /** Contact messages only. */
  topic: string | undefined;
  /** YYYY-MM-DD, Asia/Bangkok calendar day (inclusive). */
  from: string | undefined;
  to: string | undefined;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Returns the date when `value` is a real YYYY-MM-DD calendar date, else undefined. */
function parseDay(value: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value ? undefined : value;
}

/** Parses and validates searchParams. Invalid values fall back to "all"; never throws. */
export function parseLeadParams(kind: LeadKind, raw: RawParams): LeadParams {
  const status = first(raw.status);
  const topic = first(raw.topic);
  const assignee = first(raw.assignee);
  const page = first(raw.page);
  return {
    status: LEAD_STATUSES[kind].includes(status) ? status : undefined,
    q: first(raw.q).trim().slice(0, MAX_QUERY_LENGTH),
    assignee:
      assignee === "none"
        ? "none"
        : /^\d{1,9}$/.test(assignee) && Number(assignee) > 0
          ? Number(assignee)
          : "all",
    topic: kind === "contact" && (CONTACT_TOPICS as readonly string[]).includes(topic) ? topic : undefined,
    from: parseDay(first(raw.from)),
    to: parseDay(first(raw.to)),
    page: /^\d{1,6}$/.test(page) ? Math.min(Math.max(Number(page), 1), MAX_PAGE) : 1,
  };
}

/** Query string (without "?") for links, keeping every active filter; `overrides` replace values. */
export function leadQueryString(params: LeadParams, overrides: Partial<Record<keyof LeadParams, string | number | undefined>> = {}): string {
  const merged: Record<string, string | number | undefined> = {
    status: params.status,
    q: params.q || undefined,
    assignee: params.assignee === "all" ? undefined : params.assignee,
    topic: params.topic,
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

/** Asia/Bangkok day bounds: [from 00:00, day after `to` 00:00). */
function createdAtRange(params: LeadParams): Prisma.DateTimeFilter | undefined {
  const range: Prisma.DateTimeFilter = {};
  if (params.from) range.gte = new Date(`${params.from}T00:00:00+07:00`);
  if (params.to) range.lt = new Date(new Date(`${params.to}T00:00:00+07:00`).getTime() + 24 * 60 * 60 * 1000);
  return range.gte || range.lt ? range : undefined;
}

function common(params: LeadParams) {
  return {
    ...(params.status ? { status: params.status } : {}),
    ...(params.assignee === "none"
      ? { assigneeId: null }
      : typeof params.assignee === "number"
        ? { assigneeId: params.assignee }
        : {}),
    ...(createdAtRange(params) ? { createdAt: createdAtRange(params) } : {}),
  };
}

function contains(q: string) {
  return { contains: q, mode: "insensitive" as const };
}

export function contactWhere(params: LeadParams): Prisma.ContactMessageWhereInput {
  const q = params.q;
  return {
    ...common(params),
    ...(params.topic ? { topic: params.topic } : {}),
    ...(q
      ? {
          OR: [
            { name: contains(q) },
            { phone: contains(q) },
            { product: contains(q) },
            { message: contains(q) },
            { industry: contains(q) },
          ],
        }
      : {}),
  };
}

export function quoteWhere(params: LeadParams): Prisma.QuoteRequestWhereInput {
  const q = params.q;
  return {
    ...common(params),
    ...(q
      ? {
          OR: [
            { name: contains(q) },
            { company: contains(q) },
            { phone: contains(q) },
            { email: contains(q) },
            { message: contains(q) },
            { items: { some: { productName: contains(q) } } },
          ],
        }
      : {}),
  };
}

export function warrantyWhere(params: LeadParams): Prisma.WarrantyClaimWhereInput {
  const q = params.q;
  return {
    ...common(params),
    ...(q
      ? {
          OR: [
            { name: contains(q) },
            { phone: contains(q) },
            { email: contains(q) },
            { serialNumber: contains(q) },
            { productSlug: contains(q) },
            { issue: contains(q) },
          ],
        }
      : {}),
  };
}

export type LeadPage = { page: number; pageCount: number; total: number; skip: number };

/** Clamps the requested page into 1..pageCount for a known total. */
export function leadPagination(requestedPage: number, total: number): LeadPage {
  const pageCount = Math.max(1, Math.ceil(total / LEAD_PAGE_SIZE));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  return { page, pageCount, total, skip: (page - 1) * LEAD_PAGE_SIZE };
}

const assigneeInclude = { assignee: { select: { id: true, name: true } } } as const;

export async function listContactMessages(params: LeadParams) {
  const where = contactWhere(params);
  const paging = leadPagination(params.page, await prisma.contactMessage.count({ where }));
  const rows = await prisma.contactMessage.findMany({
    where,
    include: assigneeInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: paging.skip,
    take: LEAD_PAGE_SIZE,
  });
  return { rows, ...paging };
}

export async function listQuoteRequests(params: LeadParams) {
  const where = quoteWhere(params);
  const paging = leadPagination(params.page, await prisma.quoteRequest.count({ where }));
  const rows = await prisma.quoteRequest.findMany({
    where,
    include: { items: true, ...assigneeInclude },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: paging.skip,
    take: LEAD_PAGE_SIZE,
  });
  return { rows, ...paging };
}

export async function listWarrantyClaims(params: LeadParams) {
  const where = warrantyWhere(params);
  const paging = leadPagination(params.page, await prisma.warrantyClaim.count({ where }));
  const rows = await prisma.warrantyClaim.findMany({
    where,
    include: assigneeInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: paging.skip,
    take: LEAD_PAGE_SIZE,
  });
  return { rows, ...paging };
}

/** Admins that a lead can be assigned to (for the assignee select and filter). */
export function listAssigneeOptions() {
  return prisma.adminUser.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
}

export type LeadDetailsState = { ok: boolean; error?: string } | null;

type ParsedDetails = { adminNote?: string | null; assigneeId?: number | null };

/** Pure validation of the note + assignee form fields. Existence of the assignee is checked separately. */
export function parseLeadDetails(formData: FormData): { ok: true; value: ParsedDetails } | { ok: false; error: string } {
  const noteRaw = formData.get("adminNote");
  const assigneeRaw = formData.get("assigneeId");
  if (noteRaw !== null && typeof noteRaw !== "string") return { ok: false, error: "ข้อมูลโน้ตไม่ถูกต้อง" };
  if (assigneeRaw !== null && typeof assigneeRaw !== "string") return { ok: false, error: "ข้อมูลผู้รับผิดชอบไม่ถูกต้อง" };
  const note = (noteRaw ?? "").trim();
  if (note.length > LEAD_NOTE_MAX) return { ok: false, error: `โน้ตยาวเกิน ${LEAD_NOTE_MAX} ตัวอักษร` };
  const assignee = (assigneeRaw ?? "").trim();
  if (assignee !== "" && !/^\d{1,9}$/.test(assignee)) return { ok: false, error: "ข้อมูลผู้รับผิดชอบไม่ถูกต้อง" };
  // A field missing from the form is left unchanged, so the assignee select and the note box can save separately.
  return {
    ok: true,
    value: {
      ...(noteRaw !== null ? { adminNote: note === "" ? null : note } : {}),
      ...(assigneeRaw !== null ? { assigneeId: assignee === "" ? null : Number(assignee) } : {}),
    },
  };
}

/**
 * Saves note + assignee for one lead. The calling server action must have
 * called requireAdmin() already. Checks the id and that the assignee exists.
 */
export async function saveLeadDetails(
  kind: LeadKind,
  id: number,
  formData: FormData,
  actor?: { userId: number; email: string; name: string },
): Promise<LeadDetailsState> {
  if (!Number.isInteger(id) || id <= 0) return { ok: false, error: "ไม่พบรายการ" };
  const parsed = parseLeadDetails(formData);
  if (!parsed.ok) return { ok: false, error: parsed.error };
  const { adminNote, assigneeId } = parsed.value;
  if (assigneeId !== undefined && assigneeId !== null) {
    const admin = await prisma.adminUser.findUnique({ where: { id: assigneeId }, select: { id: true } });
    if (!admin) return { ok: false, error: "ไม่พบผู้รับผิดชอบที่เลือก" };
  }
  const data = {
    ...(adminNote !== undefined ? { adminNote } : {}),
    ...(assigneeId !== undefined ? { assigneeId } : {}),
  };
  if (Object.keys(data).length === 0) return { ok: true };
  const type = kind === "contact" ? "ContactMessage" : kind === "quote" ? "QuoteRequest" : "WarrantyClaim";
  const before = actor ? await loadSnapshot(type, id) : null;
  const result =
    kind === "contact"
      ? await prisma.contactMessage.updateMany({ where: { id }, data })
      : kind === "quote"
        ? await prisma.quoteRequest.updateMany({ where: { id }, data })
        : await prisma.warrantyClaim.updateMany({ where: { id }, data });
  if (result.count === 0) return { ok: false, error: "ไม่พบรายการ" };
  if (actor && before) await auditEntity(actor, type, before, await loadSnapshot(type, id));
  return { ok: true };
}
