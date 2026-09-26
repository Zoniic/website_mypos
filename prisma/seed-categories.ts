/**
 * Seeds the built-in Category and BusinessType lookup rows, which product
 * saves connect to by slug. Lines and business types added later in the
 * admin (/admin/catalog) create their own rows. Idempotent — safe to re-run.
 *
 * Run: npx tsx prisma/seed-categories.ts
 */
import { PrismaClient } from "@prisma/client";
import { PRODUCT_CATEGORIES as CATEGORIES } from "../src/data/categories";
import { BUSINESS_TYPES } from "../src/data/businessTypes";

const prisma = new PrismaClient();



async function main() {
  for (const slug of CATEGORIES) {
    await prisma.category.upsert({ where: { slug }, create: { slug }, update: {} });
  }
  for (const slug of BUSINESS_TYPES) {
    await prisma.businessType.upsert({ where: { slug }, create: { slug }, update: {} });
  }
  console.log(`Seeded ${CATEGORIES.length} categories and ${BUSINESS_TYPES.length} business types.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
