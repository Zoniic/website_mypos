/**
 * Category and BusinessType are fixed lookup tables — the admin Product
 * form's checkboxes (CategoryCheckboxes.tsx, BusinessTypeCheckboxes.tsx)
 * hardcode these slug lists and expect matching rows to already exist so
 * `prisma.product.create({ data: { categories: { connect: ... } } } })`
 * can resolve them. There's no admin CRUD for these two tables (they're
 * a closed taxonomy, not editable content), so they must be seeded here
 * instead. Idempotent — safe to re-run.
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
