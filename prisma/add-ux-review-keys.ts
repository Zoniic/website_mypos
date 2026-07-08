/**
 * One-off, idempotent migration: pushes new UX-fix copy keys
 * (clear-filters / show-filters / hide-filters / no-photo strings)
 * from messages/*.json into MySQL. Runtime content is DB-backed, so the
 * JSON files alone don't reach the live site.
 *
 * Run once: npx tsx prisma/add-ux-review-keys.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const locales = ["th", "en", "zh"] as const;
const keysByNamespace: Record<string, string[]> = {
  productsCommon: ["clearFilters", "showFilters", "hideFilters"],
  references: ["clearFilters", "noPhoto"],
};
const messagesDir = path.join(__dirname, "..", "messages");

async function main() {
  for (const locale of locales) {
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));

    for (const [namespace, keys] of Object.entries(keysByNamespace)) {
      const section = messages[namespace];
      if (!section) continue;

      for (const key of keys) {
        const value = section[key];
        if (value === undefined) continue;
        await prisma.pageContent.upsert({
          where: { namespace_key_locale: { namespace, key, locale } },
          create: { namespace, key, locale, value: String(value) },
          update: { value: String(value) },
        });
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
