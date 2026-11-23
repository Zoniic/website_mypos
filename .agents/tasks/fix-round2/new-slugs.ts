// Read-only: lists the new site's product, accessory, reference, solution and KB slugs with Thai names.
import { PrismaClient } from "@prisma/client";
import { buildCatalog, CATALOG_KEYS } from "../../../src/lib/catalog";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({ include: { translations: { where: { locale: "en" } }, categories: true }, orderBy: { slug: "asc" } });
  console.log("PRODUCTS");
  for (const p of products) console.log(`  ${p.slug}\t${p.translations[0]?.name ?? ""}\t[${p.categories.map((c) => c.slug).join(",")}]`);
  const acc = await prisma.accessory.findMany({ include: { translations: { where: { locale: "en" } }, categories: true }, orderBy: { slug: "asc" } });
  console.log("ACCESSORIES");
  for (const a of acc) console.log(`  ${a.slug}\t${a.translations[0]?.name ?? ""}`);
  const refs = await prisma.referenceCase.findMany({ include: { translations: { where: { locale: "en" } } }, orderBy: { slug: "asc" } });
  console.log("REFERENCES");
  for (const r of refs) console.log(`  ${r.slug}\t${r.translations[0]?.business ?? ""}`);
  const rows = await prisma.siteSetting.findMany({ where: { key: { in: [...CATALOG_KEYS] } } });
  const catalog = buildCatalog(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  console.log("SOLUTIONS " + catalog.solutions.map((s) => s.slug).join(", "));
  console.log("INDUSTRIES " + catalog.businessTypes.map((s) => s.slug).join(", "));
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message.slice(0, 300) : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
