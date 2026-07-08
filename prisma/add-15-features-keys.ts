/**
 * One-off, idempotent migration: pushes the new copy keys added for the
 * "review 1-15" feature batch (analytics/404/search/RFQ/compare/stock/
 * blog/case-study-detail/video/newsletter/warranty/careers) from
 * messages/*.json into MySQL. Only touches the specific new keys listed
 * below — never a blanket namespace dump — so it can't clobber content an
 * admin has since edited via the CMS for anything else.
 *
 * Run once: npx tsx prisma/add-15-features-keys.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const locales = ["th", "en", "zh"] as const;
const messagesDir = path.join(__dirname, "..", "messages");

// Brand-new namespaces: push every top-level key in the namespace.
const newFullNamespaces = ["notFound", "search", "compare", "careers", "blog"] as const;

// Existing namespaces: push only these specific new keys.
const newKeysInExistingNamespace: Record<string, string[]> = {
  nav: ["search", "compare", "blog", "careers"],
  footer: [
    "newsletterTitle",
    "newsletterPlaceholder",
    "newsletterSubmit",
    "newsletterSuccess",
    "newsletterAlready",
    "newsletterInvalid",
  ],
  productsCommon: [
    "stockInStock",
    "stockPreorder",
    "stockOutOfStock",
    "leadTimeLabel",
    "addToCompare",
    "removeFromCompare",
  ],
  productDetail: ["stockInStock", "stockPreorder", "stockOutOfStock", "leadTimeLabel", "videoTitle"],
};

// Existing namespace, brand-new nested object: push with a dot-path prefix.
const newNestedObjects: { namespace: string; prefix: string }[] = [{ namespace: "service", prefix: "warranty" }];

async function upsert(namespace: string, key: string, locale: string, value: unknown) {
  if (value === undefined) return;
  await prisma.pageContent.upsert({
    where: { namespace_key_locale: { namespace, key, locale } },
    create: { namespace, key, locale, value: String(value) },
    update: { value: String(value) },
  });
}

async function main() {
  for (const locale of locales) {
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));

    for (const namespace of newFullNamespaces) {
      const section = messages[namespace];
      if (!section) continue;
      for (const [key, value] of Object.entries(section)) {
        await upsert(namespace, key, locale, value);
      }
    }

    for (const [namespace, keys] of Object.entries(newKeysInExistingNamespace)) {
      const section = messages[namespace];
      if (!section) continue;
      for (const key of keys) {
        await upsert(namespace, key, locale, section[key]);
      }
    }

    for (const { namespace, prefix } of newNestedObjects) {
      const nested = messages[namespace]?.[prefix];
      if (!nested) continue;
      for (const [key, value] of Object.entries(nested)) {
        await upsert(namespace, `${prefix}.${key}`, locale, value);
      }
    }
  }
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
