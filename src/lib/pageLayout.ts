import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SITE_CONTENT_TAG, SITE_CONTENT_TTL_SECONDS } from "@/lib/siteCache";

/**
 * Admin-controlled section order and visibility for each page template.
 *
 * The code defines which sections exist (and their default order); the admin
 * (/admin/layout) stores an ordered list of { id, visible } per page under the
 * SiteSetting key `layout.<page>`. Sections added to the code later appear at
 * the end until the admin places them; ids no longer in the code are ignored.
 */
export type LayoutSection = {
  id: string;
  label: string;
  /** Always shown (the page doesn't make sense without it). */
  locked?: boolean;
  /** Shown to the admin: when the section is skipped automatically. */
  note?: string;
};

export const PAGE_LAYOUTS = {
  home: {
    label: "หน้าแรก",
    path: "/",
    sections: [
      { id: "hero", label: "Hero ภาพหลักบนสุด", locked: true },
      { id: "trustLogos", label: "โลโก้ลูกค้า", note: "ซ่อนเองถ้ายังไม่มีโลโก้" },
      { id: "solutions", label: "ระบบ/สินค้าของเรา" },
      { id: "receiptTape", label: "แถบใบเสร็จ (ตัวเลขสถิติ)" },
      { id: "selfServiceBenefits", label: "ประโยชน์ของตู้สั่งอาหาร" },
      { id: "useCases", label: "ประเภทธุรกิจที่ใช้" },
      { id: "popularProducts", label: "สินค้าแนะนำ", note: "แสดงสินค้าที่ติ๊ก Featured" },
      { id: "integrations", label: "การเชื่อมต่อ" },
      { id: "pricing", label: "แพ็กเกจราคา" },
      { id: "whyMypos", label: "ทำไมต้อง MYPOS" },
      { id: "testimonials", label: "รีวิวลูกค้า" },
      { id: "about", label: "เราคือใคร" },
      { id: "faq", label: "คำถามที่พบบ่อย" },
      { id: "invite", label: "ชวนติดต่อ (ท้ายหน้า)" },
    ],
  },
  solution: {
    label: "หน้าระบบแต่ละสาย (/solutions/...)",
    path: "/solutions/self-order",
    sections: [
      { id: "hero", label: "Hero", locked: true },
      { id: "subNav", label: "แถบเมนูย่อยในหน้า" },
      { id: "painGain", label: "ปัญหา → สิ่งที่ได้" },
      { id: "selfServiceBenefits", label: "ประโยชน์ของตู้สั่งอาหาร", note: "เฉพาะหน้าตู้สั่งอาหาร" },
      { id: "details", label: "ฟีเจอร์และสเปก", note: "ซ่อนเองถ้าไม่มีข้อมูล" },
      { id: "howItWorks", label: "ขั้นตอนการทำงาน" },
      { id: "cases", label: "ผลงานลูกค้า", note: "ซ่อนเองถ้าไม่มีข้อมูล" },
      { id: "compare", label: "ตารางเปรียบเทียบรุ่น", note: "ซ่อนเองถ้าหมวดนี้ไม่มีสินค้า" },
      { id: "backOffice", label: "แถบระบบหลังบ้าน", note: "เฉพาะสายที่จัดการผ่านหลังบ้าน" },
      { id: "faq", label: "คำถามที่พบบ่อย" },
      { id: "invite", label: "ชวนติดต่อ (ท้ายหน้า)" },
    ],
  },
  industry: {
    label: "หน้าประเภทธุรกิจ (/industries/...)",
    path: "/industries/restaurant",
    sections: [
      { id: "hero", label: "Hero", locked: true },
      { id: "painGain", label: "ปัญหา → สิ่งที่ได้" },
      { id: "recommended", label: "ระบบที่แนะนำ" },
      { id: "howItWorks", label: "ขั้นตอนการทำงาน" },
      { id: "products", label: "สินค้าที่เหมาะ", note: "ซ่อนเองถ้ายังไม่มีสินค้าในประเภทนี้" },
      { id: "cases", label: "ผลงานลูกค้า", note: "ซ่อนเองถ้าไม่มีข้อมูล" },
      { id: "savings", label: "ชวนคำนวณความคุ้มค่า" },
      { id: "faq", label: "คำถามที่พบบ่อย", note: "ซ่อนเองถ้าไม่มีข้อมูล" },
      { id: "invite", label: "ชวนติดต่อ (ท้ายหน้า)" },
    ],
  },
  software: {
    label: "หน้าระบบหลังบ้าน (/software)",
    path: "/software",
    sections: [
      { id: "hero", label: "Hero", locked: true },
      { id: "features", label: "ฟีเจอร์หลัก + ระบบที่จัดการได้" },
      { id: "apps", label: "ฟีเจอร์แต่ละแอป", note: "ซ่อนเองถ้าไม่มีข้อมูล" },
      { id: "coupons", label: "คูปอง/โปรโมชัน", note: "ซ่อนเองถ้าไม่มีข้อมูล" },
      { id: "screenshots", label: "ภาพหน้าจอ" },
      { id: "invite", label: "ชวนติดต่อ (ท้ายหน้า)" },
    ],
  },
  about: {
    label: "หน้าเกี่ยวกับเรา (/about)",
    path: "/about",
    sections: [
      { id: "hero", label: "หัวข้อหลัก", locked: true },
      { id: "story", label: "เรื่องราวของเรา + รูปทีม" },
      { id: "why", label: "ทำไมต้องเรา + ตัวเลขสถิติ" },
      { id: "partners", label: "พาร์ทเนอร์อย่างเป็นทางการ", note: "ซ่อนเองถ้ายังไม่มีพาร์ทเนอร์" },
      { id: "cta", label: "ชวนนัดสาธิต (ท้ายหน้า)" },
    ],
  },
  service: {
    label: "หน้าบริการ (/service)",
    path: "/service",
    sections: [
      { id: "hero", label: "หัวข้อหลัก", locked: true },
      { id: "types", label: "ประเภทบริการ" },
      { id: "process", label: "ขั้นตอนบริการ" },
      { id: "warranty", label: "ฟอร์มแจ้งเคลม/ซ่อม" },
      { id: "faq", label: "คำถามที่พบบ่อย" },
      { id: "invite", label: "ชวนติดต่อ (ท้ายหน้า)" },
    ],
  },
} satisfies Record<string, { label: string; path: string; sections: LayoutSection[] }>;

export type PageKey = keyof typeof PAGE_LAYOUTS;

export type StoredSection = { id: string; visible: boolean };

/** `layout.<page>`, or `layout.<page>:<slug>` for a single page's own layout. */
export const layoutSettingKey = (page: PageKey, variant?: string) =>
  variant ? `layout.${page}:${variant}` : `layout.${page}`;

/** Templates whose individual pages (by slug) can override the shared layout. */
export const PAGES_WITH_VARIANTS: readonly PageKey[] = ["solution", "industry"];

export function isLayoutVariant(page: PageKey, variant: string): boolean {
  return PAGES_WITH_VARIANTS.includes(page) && /^[a-z0-9-]{1,60}$/.test(variant);
}

export function isPageKey(value: string): value is PageKey {
  return Object.hasOwn(PAGE_LAYOUTS, value);
}

/** Stored layout merged with the code's section list: known ids only, new ones appended. */
export function resolveLayout(page: PageKey, stored: StoredSection[] | null): StoredSection[] {
  const sections: LayoutSection[] = PAGE_LAYOUTS[page].sections;
  const known = new Map(sections.map((s) => [s.id, s]));
  const seen = new Set<string>();
  const out: StoredSection[] = [];
  for (const entry of stored ?? []) {
    const def = known.get(entry.id);
    if (!def || seen.has(entry.id)) continue;
    seen.add(entry.id);
    out.push({ id: entry.id, visible: def.locked ? true : entry.visible !== false });
  }
  for (const def of sections) if (!seen.has(def.id)) out.push({ id: def.id, visible: true });
  // Locked sections (the hero) always open the page.
  const locked = (s: StoredSection) => Boolean(known.get(s.id)?.locked);
  return [...out.filter(locked), ...out.filter((s) => !locked(s))];
}

export function parseStoredLayout(raw: string | undefined): StoredSection[] | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return null;
    return value
      .filter((v): v is { id: unknown; visible?: unknown } => typeof v === "object" && v !== null && "id" in v)
      .map((v) => ({ id: String(v.id), visible: v.visible !== false }));
  } catch {
    return null;
  }
}

const loadLayouts = unstable_cache(
  async () => {
    const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: "layout." } } });
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  },
  ["page-layouts"],
  { tags: [SITE_CONTENT_TAG], revalidate: SITE_CONTENT_TTL_SECONDS },
);

/**
 * Ordered ids of the sections to render on a page. `variant` (a solution or
 * industry slug) uses that page's own layout when the admin set one.
 */
export async function getPageSections(page: PageKey, variant?: string): Promise<string[]> {
  const layouts = await loadLayouts();
  const own = variant ? layouts[layoutSettingKey(page, variant)] : undefined;
  return resolveLayout(page, parseStoredLayout(own ?? layouts[layoutSettingKey(page)]))
    .filter((s) => s.visible)
    .map((s) => s.id);
}

export async function getStoredLayout(page: PageKey): Promise<StoredSection[]> {
  const layouts = await loadLayouts();
  return resolveLayout(page, parseStoredLayout(layouts[layoutSettingKey(page)]));
}

/** Per-page layouts saved for a template, keyed by slug. */
export async function getLayoutVariants(page: PageKey): Promise<Record<string, StoredSection[]>> {
  const layouts = await loadLayouts();
  const prefix = `${layoutSettingKey(page)}:`;
  return Object.fromEntries(
    Object.entries(layouts)
      .filter(([key]) => key.startsWith(prefix))
      .map(([key, raw]) => [key.slice(prefix.length), resolveLayout(page, parseStoredLayout(raw))]),
  );
}
