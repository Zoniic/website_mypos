import type { Accessory as AccessoryRow, AccessoryTranslation } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProductCategory } from "@/lib/products";

export type Accessory = {
  slug: string;
  name: string;
  description: string;
  categories: ProductCategory[];
  imageUrl?: string;
};

type RowWithTranslations = AccessoryRow & {
  translations: AccessoryTranslation[];
  categories: { slug: string }[];
};

function toAccessory(row: RowWithTranslations): Accessory {
  const translation = row.translations[0];
  return {
    slug: row.slug,
    name: translation?.name ?? row.slug,
    description: translation?.description ?? "",
    categories: row.categories.map((c) => c.slug) as ProductCategory[],
    imageUrl: row.imageUrl ?? undefined,
  };
}

export async function getAllAccessories(locale: string): Promise<Accessory[]> {
  const rows = await prisma.accessory.findMany({
    include: { translations: { where: { locale } }, categories: true },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toAccessory);
}
