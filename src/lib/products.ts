import type { Product as ProductRow, ProductTranslation } from "@prisma/client";
import { prisma } from "@/lib/prisma";

import type { ProductCategory } from "@/data/categories";

export type { ProductCategory };

import type { BusinessType } from "@/data/businessTypes";

export type { BusinessType };

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

export type StockStatus = "in_stock" | "preorder" | "out_of_stock";

export type Product = {
  slug: string;
  name: string;
  priceFrom: number;
  categories: ProductCategory[];
  businessTypes: BusinessType[];
  specs: ProductSpecs;
  /** Public URL to a PDF datasheet. Omit until a real file is available. */
  datasheetUrl?: string;
  /** Optional YouTube/Vimeo/Drive link, embedded on the product detail page. */
  videoUrl?: string;
  stockStatus: StockStatus;
  /** Estimated lead time in days. Only meaningful when stockStatus isn't "in_stock". */
  leadTimeDays?: number;
  relatedSlugs: string[];
  featured?: boolean;
  /** Main product photo, uploaded via admin. Undefined until one is set. */
  imageUrl?: string;
  /** Additional gallery photos (side/back/in-use), uploaded via admin. */
  galleryUrls: string[];
  /** Fixed online price (THB incl. VAT); undefined = quote only. */
  onlinePrice?: number;
  shopeeUrl?: string;
  lazadaUrl?: string;
};

type RowWithRelations = ProductRow & {
  translations: ProductTranslation[];
  categories: { slug: string }[];
  businessTypes: { slug: string }[];
  relatedProducts: { slug: string }[];
};

function toProduct(row: RowWithRelations): Product {
  const translation = row.translations[0];
  return {
    slug: row.slug,
    name: translation?.name ?? row.slug,
    priceFrom: row.priceFrom,
    categories: row.categories.map((c) => c.slug) as ProductCategory[],
    businessTypes: row.businessTypes.map((b) => b.slug) as BusinessType[],
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
    videoUrl: row.videoUrl ?? undefined,
    stockStatus: row.stockStatus as StockStatus,
    leadTimeDays: row.leadTimeDays ?? undefined,
    relatedSlugs: row.relatedProducts.map((p) => p.slug),
    featured: row.featured,
    imageUrl: row.imageUrl ?? undefined,
    galleryUrls: row.galleryUrls.split(",").filter(Boolean),
    onlinePrice: row.onlinePrice ?? undefined,
    shopeeUrl: row.shopeeUrl ?? undefined,
    lazadaUrl: row.lazadaUrl ?? undefined,
  };
}

export async function getAllProducts(locale: string): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    include: {
      translations: { where: { locale } },
      categories: true,
      businessTypes: true,
      relatedProducts: { select: { slug: true } },
    },
    orderBy: { id: "asc" },
  });
  return rows.map(toProduct);
}

export async function getFeaturedProducts(locale: string): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { featured: true },
    include: {
      translations: { where: { locale } },
      categories: true,
      businessTypes: true,
      relatedProducts: { select: { slug: true } },
    },
    orderBy: { id: "asc" },
  });
  return rows.map(toProduct);
}

export async function getProductBySlug(slug: string, locale: string): Promise<Product | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale } },
      categories: true,
      businessTypes: true,
      relatedProducts: { select: { slug: true } },
    },
  });
  return row ? toProduct(row) : null;
}

export async function getRelatedProducts(product: Product, locale: string): Promise<Product[]> {
  if (product.relatedSlugs.length === 0) return [];
  const rows = await prisma.product.findMany({
    where: { slug: { in: product.relatedSlugs } },
    include: {
      translations: { where: { locale } },
      categories: true,
      businessTypes: true,
      relatedProducts: { select: { slug: true } },
    },
  });
  return rows.map(toProduct);
}

export async function getProductsByCategory(
  category: ProductCategory,
  locale: string
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { categories: { some: { slug: category } } },
    include: {
      translations: { where: { locale } },
      categories: true,
      businessTypes: true,
      relatedProducts: { select: { slug: true } },
    },
    orderBy: { id: "asc" },
  });
  return rows.map(toProduct);
}

export async function getProductsByBusinessType(
  businessType: BusinessType,
  locale: string
): Promise<Product[]> {
  const rows = await prisma.product.findMany({
    where: { businessTypes: { some: { slug: businessType } } },
    include: {
      translations: { where: { locale } },
      categories: true,
      businessTypes: true,
      relatedProducts: { select: { slug: true } },
    },
    orderBy: { id: "asc" },
  });
  return rows.map(toProduct);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}
