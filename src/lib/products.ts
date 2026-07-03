import type { Product as ProductRow, ProductTranslation } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductCategory = "self-order" | "weigh-pay" | "pos" | "ticketing";

export type BusinessType =
  | "restaurant"
  | "retail"
  | "buffet"
  | "convenience"
  | "themepark"
  | "hotel"
  | "cafeteria"
  | "bakery"
  | "manufacturing";

export type ProductSpecs = {
  screenSize: string;
  os: "Android" | "Windows";
  cpu: string;
  ram: string;
  storage: string;
  connectivity: string[];
  dimensions: string;
  weight: string;
  warrantyMonths: number;
};

export type Product = {
  slug: string;
  name: string;
  priceFrom: number;
  category: ProductCategory;
  businessTypes: BusinessType[];
  specs: ProductSpecs;
  /** Public URL to a PDF datasheet. Omit until a real file is available. */
  datasheetUrl?: string;
  relatedSlugs: string[];
  featured?: boolean;
};

type RowWithTranslations = ProductRow & { translations: ProductTranslation[] };

function toProduct(row: RowWithTranslations): Product {
  const translation = row.translations[0];
  return {
    slug: row.slug,
    name: translation?.name ?? row.slug,
    priceFrom: row.priceFrom,
    category: row.category as ProductCategory,
    businessTypes: row.businessTypes.split(",").filter(Boolean) as BusinessType[],
    specs: {
      screenSize: row.screenSize,
      os: row.os as "Android" | "Windows",
      cpu: row.cpu,
      ram: row.ram,
      storage: row.storage,
      connectivity: row.connectivity.split(",").map((s) => s.trim()).filter(Boolean),
      dimensions: row.dimensions,
      weight: row.weight,
      warrantyMonths: row.warrantyMonths,
    },
    datasheetUrl: row.datasheetUrl ?? undefined,
    relatedSlugs: row.relatedSlugs.split(",").filter(Boolean),
    featured: row.featured,
  };
}

export async function getAllProducts(locale: string): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    include: { translations: { where: { locale } } },
    orderBy: { id: "asc" },
  });
  return rows.map(toProduct);
}

export async function getFeaturedProducts(locale: string): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { featured: true },
    include: { translations: { where: { locale } } },
    orderBy: { id: "asc" },
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string, locale: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: { translations: { where: { locale } } },
  });
  return row ? toProduct(row) : null;
}

export async function getRelatedProducts(product: Product, locale: string): Promise<Product[]> {
  if (product.relatedSlugs.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { slug: { in: product.relatedSlugs } },
    include: { translations: { where: { locale } } },
  });
  return rows.map(toProduct);
}

export async function getProductsByCategory(
  category: ProductCategory,
  locale: string
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { category },
    include: { translations: { where: { locale } } },
    orderBy: { id: "asc" },
  });
  return rows.map(toProduct);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}
