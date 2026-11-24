import { prisma } from "@/lib/prisma";
import { getHiddenProductSlugs } from "@/lib/hiddenProducts";

/**
 * Machines for the "works with" checkboxes, Thai name first. Hidden products
 * are left out unless already selected, so a saved choice is never dropped silently.
 */
export async function getCompatibleProductOptions(selected: string[] = []): Promise<{ slug: string; name: string }[]> {
  const [rows, hidden] = await Promise.all([
    prisma.product.findMany({
      select: { slug: true, translations: { where: { locale: "th" }, select: { name: true } } },
      orderBy: { id: "asc" },
    }),
    getHiddenProductSlugs(),
  ]);
  return rows
    .filter((row) => !hidden.includes(row.slug) || selected.includes(row.slug))
    .map((row) => ({ slug: row.slug, name: row.translations[0]?.name || row.slug }));
}
