import { getTranslations } from "next-intl/server";
import { getCatalog } from "@/lib/catalog";
import { SITE_IMAGE_SLOTS, catalogImageSlots, type SiteImageSlot } from "./slots";

/** Built-in photo slots plus one per product line / business type added in the catalog. */
export async function getAllImageSlots(): Promise<SiteImageSlot[]> {
  const catalog = await getCatalog();
  const tNav = await getTranslations({ locale: "th", namespace: "nav" });
  const tProducts = await getTranslations({ locale: "th", namespace: "productsCommon" });
  return [
    ...SITE_IMAGE_SLOTS,
    ...catalogImageSlots([
      ...catalog.solutions
        .filter((s) => !s.builtIn)
        .map((s) => ({ kind: "solution" as const, slug: s.slug, label: tNav(`solutionsItems.${s.key}`) })),
      ...catalog.businessTypes
        .filter((b) => !b.builtIn)
        .map((b) => ({ kind: "industry" as const, slug: b.slug, label: tProducts(`businessTypes.${b.slug}`) })),
    ]),
  ];
}
