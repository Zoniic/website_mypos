/**
 * What the change history knows about each kind of record: Thai label, link to
 * the edit page, how a record is snapshotted, and which text fields may be
 * restored (decisions R3a: only Page Content and translated text; prices,
 * photos, status and deleted records can be viewed, never restored).
 * Pure: no database access, so it is unit tested directly.
 */
import { diffFields, type AuditAction, type AuditChange } from "./audit";

export const AUDIT_LOCALES = ["th", "en", "zh"] as const;
export const LOCALE_LABELS: Record<string, string> = { th: "ภาษาไทย", en: "ภาษาอังกฤษ", zh: "ภาษาจีน" };
export const NOTE_MASK = "[แก้ไขแล้ว]";

export type Snapshot = Record<string, unknown>;

export type EntityConfig = {
  type: string;
  /** Thai name of the data type (filter and list). */
  label: string;
  /** Prisma delegate name when the record is snapshotted by numeric id. */
  model?: string;
  /** Limit the snapshot to these columns (leads, admin users: no customer data or secrets). */
  select?: Record<string, true>;
  /** Columns left out of the diff (ids, timestamps, label-only columns). */
  ignore?: string[];
  translations?: { relation: string; fk: string; model: string; fields: string[]; restorable: string[] };
  /** Many-to-many relations listed by slug. */
  slugRelations?: string[];
  /** Columns whose text is never copied (the history only says "edited"). */
  masked?: string[];
  /** Changes made only to these columns count as a status change. */
  statusOnly?: string[];
  labelOf: (snapshot: Snapshot) => string;
  href: (id: string) => string | null;
};

const str = (v: unknown) => (typeof v === "string" ? v : "");

function translationName(snapshot: Snapshot, field: string): string {
  const list = Array.isArray(snapshot.translations) ? (snapshot.translations as Snapshot[]) : [];
  const th = list.find((t) => t.locale === "th") ?? list[0];
  return th ? str(th[field]) : "";
}

function translated(
  type: string,
  label: string,
  model: string,
  translationModel: string,
  fk: string,
  fields: string[],
  nameField: string,
  base: string,
  extra: Partial<EntityConfig> = {},
): EntityConfig {
  return {
    type,
    label,
    model,
    translations: { relation: "translations", fk, model: translationModel, fields, restorable: fields },
    labelOf: (s) => translationName(s, nameField) || str(s.slug) || `#${String(s.id)}`,
    href: (id) => `${base}/${id}/edit`,
    ...extra,
  };
}

export const ENTITIES: Record<string, EntityConfig> = {
  PageContent: {
    type: "PageContent",
    label: "ข้อความทุกหน้า",
    labelOf: (s) => str(s.label),
    href: (id) => `/admin/content/${id.split(".")[0]}`,
  },
  SiteSetting: { type: "SiteSetting", label: "ตั้งค่าเว็บไซต์", labelOf: (s) => str(s.label), href: () => null },
  SiteImage: { type: "SiteImage", label: "รูปภาพและโลโก้", labelOf: (s) => str(s.label), href: () => "/admin/photos" },
  Product: translated("Product", "สินค้า", "product", "productTranslation", "productId", ["name", "highlight"], "name", "/admin/products", {
    slugRelations: ["categories", "businessTypes", "relatedProducts"],
  }),
  Accessory: translated("Accessory", "อุปกรณ์เสริม", "accessory", "accessoryTranslation", "accessoryId", ["name", "description", "specs"], "name", "/admin/accessories", {
    slugRelations: ["categories", "compatibleProducts"],
  }),
  ReferenceCase: translated(
    "ReferenceCase", "ผลงานลูกค้า", "referenceCase", "referenceCaseTranslation", "caseId",
    ["business", "problem", "install", "result"], "business", "/admin/references",
  ),
  KbCategory: translated("KbCategory", "หมวดคลังความรู้", "kbCategory", "kbCategoryTranslation", "categoryId", ["name"], "name", "/admin/kb-categories"),
  KbArticle: translated("KbArticle", "คลังความรู้", "kbArticle", "kbArticleTranslation", "articleId", ["title", "summary", "body"], "title", "/admin/kb-articles"),
  BlogPost: translated("BlogPost", "บทความ", "blogPost", "blogPostTranslation", "postId", ["title", "excerpt", "body"], "title", "/admin/blog"),
  JobPosting: translated("JobPosting", "ตำแหน่งงาน", "jobPosting", "jobPostingTranslation", "jobId", ["title", "description"], "title", "/admin/careers"),
  TrustLogo: { type: "TrustLogo", label: "โลโก้ลูกค้า", model: "trustLogo", labelOf: (s) => str(s.name), href: (id) => `/admin/trust-logos/${id}/edit` },
  OfficialPartner: {
    type: "OfficialPartner",
    label: "พาร์ทเนอร์",
    model: "officialPartner",
    labelOf: (s) => str(s.name),
    href: (id) => `/admin/official-partners/${id}/edit`,
  },
  AdminUser: {
    type: "AdminUser",
    label: "บัญชีผู้ดูแล",
    model: "adminUser",
    select: { id: true, email: true, name: true, role: true },
    labelOf: (s) => str(s.email) || str(s.name),
    href: () => "/admin/admin-users",
  },
  ContactMessage: {
    type: "ContactMessage",
    label: "ข้อความติดต่อ",
    model: "contactMessage",
    select: { id: true, name: true, status: true, assigneeId: true, adminNote: true },
    ignore: ["name"],
    masked: ["adminNote"],
    statusOnly: ["status"],
    labelOf: (s) => `${str(s.name)} #${String(s.id)}`,
    href: () => "/admin/contact-messages",
  },
  QuoteRequest: {
    type: "QuoteRequest",
    label: "ขอใบเสนอราคา",
    model: "quoteRequest",
    select: { id: true, name: true, status: true, assigneeId: true, adminNote: true },
    ignore: ["name"],
    masked: ["adminNote"],
    statusOnly: ["status"],
    labelOf: (s) => `${str(s.name)} #${String(s.id)}`,
    href: () => "/admin/quote-requests",
  },
  WarrantyClaim: {
    type: "WarrantyClaim",
    label: "แจ้งซ่อม / เคลม",
    model: "warrantyClaim",
    select: { id: true, name: true, status: true, assigneeId: true, adminNote: true },
    ignore: ["name"],
    masked: ["adminNote"],
    statusOnly: ["status"],
    labelOf: (s) => `${str(s.name)} #${String(s.id)}`,
    href: () => "/admin/warranty-claims",
  },
  Order: {
    type: "Order",
    label: "ออเดอร์",
    model: "order",
    select: { id: true, number: true, status: true, adminNote: true, paidAt: true },
    ignore: ["number"],
    masked: ["adminNote"],
    statusOnly: ["status", "paidAt"],
    labelOf: (s) => `ออเดอร์ ${str(s.number)}`,
    href: (id) => `/admin/orders/${id}`,
  },
  Script: { type: "Script", label: "สคริปต์ข้อมูล", labelOf: (s) => str(s.label), href: () => null },
};

export const ENTITY_TYPES = Object.keys(ENTITIES);
export const entityLabel = (type: string) => ENTITIES[type]?.label ?? type;

export const ACTION_LABELS: Record<string, string> = {
  create: "สร้าง",
  update: "แก้ไข",
  delete: "ลบ",
  status_change: "เปลี่ยนสถานะ",
  restore: "กู้คืน",
  login: "เข้าสู่ระบบ",
  role_change: "เปลี่ยนบทบาท",
  password_change: "เปลี่ยนรหัสผ่าน",
  "2fa_enable": "เปิดรหัส 2 ขั้นตอน",
  "2fa_disable": "ปิดรหัส 2 ขั้นตอน",
  "2fa_reset": "รีเซ็ตรหัส 2 ขั้นตอน",
};

const SKIP = new Set(["id", "createdAt", "updatedAt"]);

/** Plain columns of a snapshot as one flat object (translations and slug relations folded in or left out). */
function flatten(config: EntityConfig, snapshot: Snapshot | null): Record<string, unknown> | null {
  if (!snapshot) return null;
  const skip = new Set([...SKIP, ...(config.ignore ?? []), "translations", ...(config.slugRelations ?? [])]);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(snapshot)) if (!skip.has(key)) out[key] = value;
  for (const relation of config.slugRelations ?? []) {
    const list = snapshot[relation];
    if (Array.isArray(list)) out[relation] = list.map((r) => str((r as Snapshot).slug)).sort().join(",");
  }
  return out;
}

function translationsByLocale(config: EntityConfig, snapshot: Snapshot | null): Record<string, Record<string, unknown>> {
  const out: Record<string, Record<string, unknown>> = {};
  if (!snapshot || !config.translations) return out;
  const list = snapshot[config.translations.relation];
  if (!Array.isArray(list)) return out;
  for (const row of list as Snapshot[]) {
    const picked: Record<string, unknown> = {};
    for (const field of config.translations.fields) picked[field] = row[field];
    out[str(row.locale)] = picked;
  }
  return out;
}

const dropEmpty = (changes: AuditChange[]) => changes.filter((c) => !(c.before === null && c.after === null));

/** Field changes between two snapshots of one record. before null = create, after null = delete. */
export function entityChanges(config: EntityConfig, before: Snapshot | null, after: Snapshot | null): AuditChange[] {
  let changes = dropEmpty(diffFields(flatten(config, before), flatten(config, after)));
  const masked = new Set(config.masked ?? []);
  if (masked.size) {
    changes = changes.map((c) =>
      masked.has(c.field)
        ? { ...c, before: c.before === null || c.before === "" ? null : NOTE_MASK, after: c.after === null || c.after === "" ? null : NOTE_MASK }
        : c,
    );
  }
  if (config.translations) {
    const b = translationsByLocale(config, before);
    const a = translationsByLocale(config, after);
    for (const locale of [...new Set([...Object.keys(b), ...Object.keys(a)])].sort()) {
      const left = before ? (b[locale] ?? null) : null;
      const right = after ? (a[locale] ?? null) : null;
      // A locale that exists on only one side of an update is a create or delete of that language.
      changes.push(...dropEmpty(diffFields(left, right, { locale })));
    }
  }
  return changes;
}

export function entityAction(
  config: EntityConfig,
  before: Snapshot | null,
  after: Snapshot | null,
  changes: AuditChange[],
): AuditAction {
  if (!before) return "create";
  if (!after) return "delete";
  const only = config.statusOnly;
  if (only && changes.length > 0 && changes.every((c) => !c.locale && only.includes(c.field))) return "status_change";
  return "update";
}

export type ContentRow = { key: string; locale: string; value: string };
export type ContentKeyChange = { key: string; action: "create" | "update"; changes: AuditChange[] };

/**
 * Page Content changes grouped by key (one history row per key, all languages
 * together). Unchanged keys are left out, so saving a form with 200 untouched
 * keys records nothing.
 */
export function contentChangesByKey(existing: ContentRow[], updates: ContentRow[]): ContentKeyChange[] {
  const old = new Map(existing.map((r) => [`${r.key}\u0000${r.locale}`, r.value]));
  const known = new Set(existing.map((r) => r.key));
  const byKey = new Map<string, AuditChange[]>();
  for (const u of updates) {
    const before = old.get(`${u.key}\u0000${u.locale}`);
    if (before === u.value) continue;
    const list = byKey.get(u.key) ?? [];
    list.push({ field: "value", locale: u.locale, before: before ?? null, after: u.value });
    byKey.set(u.key, list);
  }
  return [...byKey.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, changes]) => ({ key, action: known.has(key) ? ("update" as const) : ("create" as const), changes: changes.sort((x, y) => ((x.locale ?? "") < (y.locale ?? "") ? -1 : 1)) }));
}

/** Splits a Page Content entity id ("namespace.key.path") at the first dot. */
export function splitContentId(entityId: string): { namespace: string; key: string } | null {
  const i = entityId.indexOf(".");
  if (i <= 0 || i === entityId.length - 1) return null;
  return { namespace: entityId.slice(0, i), key: entityId.slice(i + 1) };
}

/** True when this field (in this language) of this kind of record is text the owner may restore. */
export function isRestorableField(entityType: string, field: string, locale: string | undefined): boolean {
  if (!locale || !(AUDIT_LOCALES as readonly string[]).includes(locale)) return false;
  if (entityType === "PageContent") return field === "value";
  const config = ENTITIES[entityType];
  return Boolean(config?.translations?.restorable.includes(field));
}

/**
 * A change can be restored when it edited text (create and delete rows never
 * qualify) and there is an old text value to put back.
 */
export function isRestorableChange(row: { action: string; entityType: string }, change: AuditChange): boolean {
  if (row.action !== "update" && row.action !== "restore") return false;
  return typeof change.before === "string" && isRestorableField(row.entityType, change.field, change.locale);
}
