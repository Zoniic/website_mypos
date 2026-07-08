import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const locales = ["th", "en", "zh"] as const;
const messagesDir = path.join(__dirname, "..", "messages");

function loadMessages(locale: string) {
  const file = path.join(messagesDir, `${locale}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function flatten(obj: unknown, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  if (obj === null || typeof obj !== "object") return result;

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(value)) {
      result[currentPath] = JSON.stringify(value);
    } else if (value !== null && typeof value === "object") {
      Object.assign(result, flatten(value, currentPath));
    } else {
      result[currentPath] = String(value);
    }
  }
  return result;
}

// Namespaces where the "items" array is handled as a structured entity
// instead of generic PageContent (everything else in these namespaces,
// like metaTitle/title/subtitle, is still stored as normal page content).
const namespacesWithStructuredItems = new Set(["products", "accessories", "references"]);

async function seedPageContent() {
  console.log("Seeding page content...");
  const rows: { namespace: string; key: string; locale: string; value: string }[] = [];

  for (const locale of locales) {
    const messages = loadMessages(locale);
    for (const [namespace, content] of Object.entries(messages)) {
      const contentToFlatten = namespacesWithStructuredItems.has(namespace)
        ? Object.fromEntries(
            Object.entries(content as Record<string, unknown>).filter(([k]) => k !== "items")
          )
        : content;
      const flat = flatten(contentToFlatten, "");
      for (const [key, value] of Object.entries(flat)) {
        rows.push({ namespace, key, locale, value });
      }
    }
  }

  for (const row of rows) {
    await prisma.pageContent.upsert({
      where: { namespace_key_locale: { namespace: row.namespace, key: row.key, locale: row.locale } },
      create: row,
      update: { value: row.value },
    });
  }
  console.log(`  ${rows.length} page-content rows.`);
}

/**
 * One-time migration from the old static src/data/products.ts (now deleted —
 * the DB is the source of truth going forward). This function will throw if
 * re-run since that file no longer exists; safe to delete once nobody needs
 * to re-seed from scratch.
 */
async function seedProducts() {
  console.log("Seeding products...");
  const dataFile = fs.readFileSync(
    path.join(__dirname, "..", "src", "data", "products.ts"),
    "utf8"
  );
  // Extract the products array via a lightweight eval of the TS literal (no imports needed).
  const arrayMatch = dataFile.match(/export const products: Product\[\] = (\[[\s\S]*?\n\]);/);
  if (!arrayMatch) throw new Error("Could not find products array in products.ts");
  const products = new Function(`return ${arrayMatch[1]}`)() as Array<{
    slug: string;
    name: string;
    priceFrom: number;
    category: string;
    businessTypes: string[];
    specs: {
      screenSize: string;
      os: string;
      cpu: string;
      ram: string;
      storage: string;
      connectivity: string[];
      dimensions: string;
      weight: string;
      warrantyMonths: number;
    };
    datasheetUrl?: string;
    relatedSlugs: string[];
    featured?: boolean;
  }>;

  const messagesByLocale = Object.fromEntries(locales.map((l) => [l, loadMessages(l)]));

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      create: {
        slug: product.slug,
        priceFrom: product.priceFrom,
        categories: { connectOrCreate: [{ where: { slug: product.category }, create: { slug: product.category } }] },
        os: product.specs.os,
        screenSize: product.specs.screenSize,
        cpu: product.specs.cpu,
        ram: product.specs.ram,
        storage: product.specs.storage,
        connectivity: product.specs.connectivity.join(", "),
        dimensions: product.specs.dimensions,
        weight: product.specs.weight,
        warrantyMonths: product.specs.warrantyMonths,
        datasheetUrl: product.datasheetUrl ?? null,
        featured: Boolean(product.featured),
        businessTypes: {
          connectOrCreate: product.businessTypes.map((slug) => ({
            where: { slug },
            create: { slug },
          })),
        },
      },
      update: {},
    });

    for (const locale of locales) {
      const highlight = messagesByLocale[locale]?.products?.items?.[product.slug]?.highlight ?? "";
      await prisma.productTranslation.upsert({
        where: { productId_locale: { productId: created.id, locale } },
        create: { productId: created.id, locale, name: product.name, highlight },
        update: { name: product.name, highlight },
      });
    }
  }
  console.log(`  ${products.length} products.`);
}

async function seedAccessories() {
  console.log("Seeding accessories...");
  const messagesByLocale = Object.fromEntries(locales.map((l) => [l, loadMessages(l)]));
  const items = messagesByLocale.th.accessories.items as { slug: string }[];

  for (let i = 0; i < items.length; i++) {
    const slug = items[i].slug;
    const created = await prisma.accessory.upsert({
      where: { slug },
      create: { slug, sortOrder: i },
      update: { sortOrder: i },
    });

    for (const locale of locales) {
      const item = (messagesByLocale[locale].accessories.items as { slug: string; name: string; description: string }[]).find(
        (i2) => i2.slug === slug
      );
      if (!item) continue;
      await prisma.accessoryTranslation.upsert({
        where: { accessoryId_locale: { accessoryId: created.id, locale } },
        create: { accessoryId: created.id, locale, name: item.name, description: item.description },
        update: { name: item.name, description: item.description },
      });
    }
  }
  console.log(`  ${items.length} accessories.`);
}

async function seedReferences() {
  const existing = await prisma.referenceCase.count();
  if (existing > 0) {
    console.log("Reference cases already seeded, skipping.");
    return;
  }

  console.log("Seeding reference cases...");
  const messagesByLocale = Object.fromEntries(locales.map((l) => [l, loadMessages(l)]));
  const thItems = messagesByLocale.th.references.items as { business: string; businessType: string }[];
  const enItemsForSlug = messagesByLocale.en.references.items as { business: string }[];

  for (let i = 0; i < thItems.length; i++) {
    const businessType = thItems[i].businessType;
    const slugBase = (enItemsForSlug[i]?.business || thItems[i].business || `case-${i}`)
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    const slug = slugBase || `case-${i}`;
    const created = await prisma.referenceCase.create({
      data: { slug, businessType, sortOrder: i },
    });

    for (const locale of locales) {
      const items = messagesByLocale[locale].references.items as {
        business: string;
        businessType: string;
        problem: string;
        install: string;
        result: string;
      }[];
      const item = items[i];
      if (!item) continue;
      await prisma.referenceCaseTranslation.create({
        data: {
          caseId: created.id,
          locale,
          business: item.business,
          problem: item.problem,
          install: item.install,
          result: item.result,
        },
      });
    }
  }
  console.log(`  ${thItems.length} reference cases.`);
}

async function main() {
  await seedPageContent();
  await seedProducts();
  await seedAccessories();
  await seedReferences();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
