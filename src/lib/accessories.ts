import type { Accessory as AccessoryRow, AccessoryTranslation } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductCategory, StockStatus } from "@/lib/products";
import { decodeSlugParam, slugKey } from "@/lib/slug";
import { getHiddenProductSlugs } from "@/lib/hiddenProducts";
import { parseSpecLines, type SpecLine } from "@/lib/specLines";

export type Accessory = {
  slug: string;
  name: string;
  description: string;
  categories: ProductCategory[];
  imageUrl?: string;
  /** Extra photos (up to 3). */
  galleryUrls: string[];
  /** "Starting at" price (THB); undefined = ask for a price. */
  priceFrom?: number;
  stockStatus: StockStatus;
  leadTimeDays?: number;
  /** Online price (THB incl. VAT); undefined = not sold online. */
  onlinePrice?: number;
  shopeeUrl?: string;
  lazadaUrl?: string;
  datasheetUrl?: string;
  videoUrl?: string;
  specs: SpecLine[];
  /** Machines this accessory works with (hidden products left out). */
  compatibleProducts: { slug: string; name: string }[];
};

type RowWithRelations = AccessoryRow & {
  translations: AccessoryTranslation[];
  categories: { slug: string }[];
  compatibleProducts?: { slug: string; translations: { name: string }[] }[];
};

const STOCK_STATUSES: StockStatus[] = ["in_stock", "preorder", "out_of_stock"];

function toAccessory(row: RowWithRelations, hidden: string[]): Accessory {
  const translation = row.translations[0];
  return {
    slug: row.slug,
    name: translation?.name ?? row.slug,
    description: translation?.description ?? "",
    categories: row.categories.map((c) => c.slug) as ProductCategory[],
    imageUrl: row.imageUrl ?? undefined,
    galleryUrls: row.galleryUrls.split(",").filter(Boolean),
    priceFrom: row.priceFrom ?? undefined,
    stockStatus: STOCK_STATUSES.includes(row.stockStatus as StockStatus) ? (row.stockStatus as StockStatus) : "in_stock",
    leadTimeDays: row.leadTimeDays ?? undefined,
    onlinePrice: row.onlinePrice ?? undefined,
    shopeeUrl: row.shopeeUrl ?? undefined,
    lazadaUrl: row.lazadaUrl ?? undefined,
    datasheetUrl: row.datasheetUrl ?? undefined,
    videoUrl: row.videoUrl ?? undefined,
    specs: parseSpecLines(translation?.specs),
    compatibleProducts: (row.compatibleProducts ?? [])
      .filter((p) => !hidden.includes(p.slug))
      .map((p) => ({ slug: p.slug, name: p.translations[0]?.name ?? p.slug })),
  };
}

function includeFor(locale: string) {
  return {
    translations: { where: { locale } },
    categories: true,
    compatibleProducts: {
      select: { slug: true, translations: { where: { locale }, select: { name: true } } },
      orderBy: { id: "asc" as const },
    },
  };
}

async function toAccessories(rows: RowWithRelations[]): Promise<Accessory[]> {
  const hidden = await getHiddenProductSlugs();
  return rows.map((row) => toAccessory(row, hidden));
}

export async function getAllAccessories(locale: string): Promise<Accessory[]> {
  const rows = await prisma.accessory.findMany({ include: includeFor(locale), orderBy: { sortOrder: "asc" } });
  return toAccessories(rows);
}

/** Exact slug, or an old-style one that differs only in case, spacing or punctuation. */
export async function getAccessoryBySlug(slug: string, locale: string): Promise<Accessory | null> {
  const include = includeFor(locale);
  const wanted = decodeSlugParam(slug);
  let row = await prisma.accessory.findUnique({ where: { slug: wanted }, include });
  if (!row && slugKey(wanted)) {
    const all = await prisma.accessory.findMany({ select: { slug: true } });
    const match = all.find((a) => slugKey(a.slug) === slugKey(wanted));
    if (match) row = await prisma.accessory.findUnique({ where: { slug: match.slug }, include });
  }
  return row ? ((await toAccessories([row]))[0] ?? null) : null;
}

/** Other accessories that share a category with this one (the "goes well with" strip). */
export async function getRelatedAccessories(accessory: Accessory, locale: string, limit = 4): Promise<Accessory[]> {
  if (accessory.categories.length === 0) return [];
  const rows = await prisma.accessory.findMany({
    where: { slug: { not: accessory.slug }, categories: { some: { slug: { in: accessory.categories } } } },
    include: includeFor(locale),
    orderBy: { sortOrder: "asc" },
    take: limit,
  });
  return toAccessories(rows);
}

/** Accessories marked as working with this machine (shown on the product page). */
export async function getAccessoriesForProduct(productSlug: string, locale: string): Promise<Accessory[]> {
  const rows = await prisma.accessory.findMany({
    where: { compatibleProducts: { some: { slug: productSlug } } },
    include: includeFor(locale),
    orderBy: { sortOrder: "asc" },
  });
  return toAccessories(rows);
}

export async function getAllAccessorySlugs(): Promise<string[]> {
  return (await prisma.accessory.findMany({ select: { slug: true }, orderBy: { sortOrder: "asc" } })).map((r) => r.slug);
}
