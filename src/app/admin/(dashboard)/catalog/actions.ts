"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { revalidatePath } from "@/lib/siteCache";
import { prisma } from "@/lib/prisma";
import {
  BUSINESS_ICONS,
  MACHINE_KINDS,
  SLUG_PATTERN,
  SOLUTION_GROUPS,
  findBusinessType,
  findSolution,
  getCatalog,
  parseCustomBusinessTypes,
  parseCustomSolutions,
  slugToKey,
} from "@/lib/catalog";
import type { MachineKind } from "@/components/ui/MachineArt";

const LOCALES = ["th", "en", "zh"] as const;
type Names = Partial<Record<(typeof LOCALES)[number], string>>;

async function upsertContent(namespace: string, key: string, locale: string, value: string) {
  await prisma.pageContent.upsert({
    where: { namespace_key_locale: { namespace, key, locale } },
    create: { namespace, key, locale, value },
    update: { value },
  });
}

async function readSetting(key: string) {
  return (await prisma.siteSetting.findUnique({ where: { key } }))?.value;
}

async function writeSetting(key: string, value: unknown) {
  const json = JSON.stringify(value);
  await prisma.siteSetting.upsert({ where: { key }, create: { key, value: json }, update: { value: json } });
}

/** Thai name required; English/Chinese fall back to it. */
function cleanNames(names: Names): Record<(typeof LOCALES)[number], string> | null {
  const th = names.th?.trim();
  if (!th) return null;
  return { th, en: names.en?.trim() || th, zh: names.zh?.trim() || th };
}

/**
 * Copies every message under `<namespace>.<fromKey>.` to `<toKey>.` in all
 * languages, so a new page starts from a complete, working template.
 */
async function copyContent(namespace: string, fromKey: string, toKey: string) {
  const rows = await prisma.pageContent.findMany({ where: { namespace, key: { startsWith: `${fromKey}.` } } });
  for (const row of rows) {
    await upsertContent(namespace, `${toKey}.${row.key.slice(fromKey.length + 1)}`, row.locale, row.value);
  }
  return rows.length;
}

function done() {
  revalidatePath("/admin/catalog");
  return "saved";
}

export async function createSolution(input: {
  slug: string;
  names: Names;
  template: string;
  machine: string;
  group: string;
  blurb: Names;
}): Promise<string> {
  await requireAdmin();
  const slug = input.slug.trim().toLowerCase();
  const names = cleanNames(input.names);
  const catalog = await getCatalog();
  const key = slugToKey(slug);

  if (!SLUG_PATTERN.test(slug)) return "Slug: ใช้ a-z, 0-9 และขีดกลาง เช่น self-checkout";
  if (!names) return "ใส่ชื่อภาษาไทย";
  if (catalog.solutions.some((s) => s.slug === slug || s.key === key)) return `มีสายสินค้า "${slug}" อยู่แล้ว`;
  if (catalog.categories.includes(slug)) return `slug "${slug}" ซ้ำกับหมวดสินค้าที่มีอยู่`;
  const template = findSolution(catalog, input.template);
  if (!template) return "เลือกหน้าต้นแบบ";
  if (!MACHINE_KINDS.includes(input.machine as MachineKind)) return "เลือกภาพเครื่อง";
  if (!(SOLUTION_GROUPS as readonly string[]).includes(input.group)) return "เลือกกลุ่มเมนู";

  const copied = await copyContent("solutions", template.key, key);
  if (copied === 0) return "หน้าต้นแบบไม่มีข้อความให้คัดลอก เลือกหน้าอื่น";
  for (const locale of LOCALES) {
    const name = names[locale];
    await upsertContent("solutions", `${key}.hero.eyebrow`, locale, name);
    await upsertContent("solutions", `${key}.metaTitle`, locale, `${name} | MYPOS`);
    await upsertContent("nav", `solutionsItems.${key}`, locale, name);
    await upsertContent("productsCommon", `categories.${slug}`, locale, name);
    const blurb = input.blurb[locale]?.trim() || input.blurb.th?.trim();
    if (blurb) await upsertContent("industries", `common.solutionBlurbs.${key}`, locale, blurb);
  }
  // Products and accessories are tagged with the line's own category.
  await prisma.category.upsert({ where: { slug }, create: { slug }, update: {} });

  const current = parseCustomSolutions(await readSetting("catalog.solutions"));
  await writeSetting("catalog.solutions", [
    ...current.map(({ slug, category, machine, group, published }) => ({ slug, category, machine, group, published })),
    { slug, category: slug, machine: input.machine, group: input.group, published: false },
  ]);
  return done();
}

export async function createBusinessType(input: {
  slug: string;
  names: Names;
  template: string;
  icon: string;
}): Promise<string> {
  await requireAdmin();
  const slug = input.slug.trim().toLowerCase();
  const names = cleanNames(input.names);
  const catalog = await getCatalog();

  if (!SLUG_PATTERN.test(slug)) return "Slug: ใช้ a-z, 0-9 และขีดกลาง เช่น hospital";
  if (!names) return "ใส่ชื่อภาษาไทย";
  if (findBusinessType(catalog, slug) || slug === "common") return `มีประเภทธุรกิจ "${slug}" อยู่แล้ว`;
  if (!findBusinessType(catalog, input.template)) return "เลือกหน้าต้นแบบ";
  if (!(BUSINESS_ICONS as readonly string[]).includes(input.icon)) return "เลือกไอคอน";

  const copied = await copyContent("industries", input.template, slug);
  if (copied === 0) return "หน้าต้นแบบไม่มีข้อความให้คัดลอก เลือกหน้าอื่น";
  for (const locale of LOCALES) {
    const name = names[locale];
    await upsertContent("industries", `${slug}.hero.eyebrow`, locale, name);
    await upsertContent("industries", `${slug}.metaTitle`, locale, `${name} | MYPOS`);
    await upsertContent("productsCommon", `businessTypes.${slug}`, locale, name);
  }
  await prisma.businessType.upsert({ where: { slug }, create: { slug }, update: {} });

  const current = parseCustomBusinessTypes(await readSetting("catalog.businessTypes"));
  await writeSetting("catalog.businessTypes", [
    ...current.map(({ slug, icon, published }) => ({ slug, icon, published })),
    { slug, icon: input.icon, published: false },
  ]);
  return done();
}

export async function updateSolution(
  slug: string,
  change: { machine?: string; group?: string; published?: boolean },
): Promise<string> {
  await requireAdmin();
  const current = parseCustomSolutions(await readSetting("catalog.solutions"));
  if (!current.some((s) => s.slug === slug)) return "สายสินค้าในระบบแก้ได้ที่ Navigation / Page Content เท่านั้น";
  if (change.machine && !MACHINE_KINDS.includes(change.machine as MachineKind)) return "ภาพเครื่องไม่ถูกต้อง";
  if (change.group && !(SOLUTION_GROUPS as readonly string[]).includes(change.group)) return "กลุ่มเมนูไม่ถูกต้อง";
  await writeSetting(
    "catalog.solutions",
    current.map(({ slug: s, category, machine, group, published }) =>
      s === slug
        ? { slug: s, category, machine: change.machine ?? machine, group: change.group ?? group, published: change.published ?? published }
        : { slug: s, category, machine, group, published },
    ),
  );
  return done();
}

export async function updateBusinessType(slug: string, change: { icon?: string; published?: boolean }): Promise<string> {
  await requireAdmin();
  const current = parseCustomBusinessTypes(await readSetting("catalog.businessTypes"));
  if (!current.some((b) => b.slug === slug)) return "ประเภทธุรกิจในระบบแก้ได้ที่ Navigation / Page Content เท่านั้น";
  if (change.icon && !(BUSINESS_ICONS as readonly string[]).includes(change.icon)) return "ไอคอนไม่ถูกต้อง";
  await writeSetting(
    "catalog.businessTypes",
    current.map(({ slug: s, icon, published }) =>
      s === slug ? { slug: s, icon: change.icon ?? icon, published: change.published ?? published } : { slug: s, icon, published },
    ),
  );
  return done();
}

/**
 * Removes an added line and its copy. Its product category stays, so
 * products already tagged with it keep saving; untag them if it's gone for good.
 */
export async function deleteSolution(slug: string): Promise<string> {
  await requireAdmin();
  const current = parseCustomSolutions(await readSetting("catalog.solutions"));
  const line = current.find((s) => s.slug === slug);
  if (!line) return "ลบได้เฉพาะสายสินค้าที่เพิ่มเอง";
  await writeSetting(
    "catalog.solutions",
    current.filter((s) => s.slug !== slug).map(({ slug, category, machine, group, published }) => ({ slug, category, machine, group, published })),
  );
  await prisma.pageContent.deleteMany({
    where: {
      OR: [
        { namespace: "solutions", key: { startsWith: `${line.key}.` } },
        { namespace: "nav", key: `solutionsItems.${line.key}` },
        { namespace: "industries", key: `common.solutionBlurbs.${line.key}` },
      ],
    },
  });
  await prisma.siteSetting.deleteMany({ where: { key: `layout.solution:${slug}` } });
  return done();
}

export async function deleteBusinessType(slug: string): Promise<string> {
  await requireAdmin();
  const current = parseCustomBusinessTypes(await readSetting("catalog.businessTypes"));
  if (!current.some((b) => b.slug === slug)) return "ลบได้เฉพาะประเภทธุรกิจที่เพิ่มเอง";
  await writeSetting(
    "catalog.businessTypes",
    current.filter((b) => b.slug !== slug).map(({ slug, icon, published }) => ({ slug, icon, published })),
  );
  await prisma.pageContent.deleteMany({ where: { namespace: "industries", key: { startsWith: `${slug}.` } } });
  await prisma.siteSetting.deleteMany({ where: { key: `layout.industry:${slug}` } });
  return done();
}
