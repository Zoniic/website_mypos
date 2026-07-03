/**
 * One-off migration: overwrites the software.features.items PageContent
 * row (th/en/zh) with the current messages/*.json content, which now
 * leads with a "Web-Based Back Office Dashboard" feature. Runtime content
 * is DB-backed (see README), so this JSON change alone doesn't reach the
 * live site.
 *
 * NOTE: this OVERWRITES the current DB value for this key. If an admin has
 * since hand-edited software.features.items via Admin -> Page Content,
 * back that up first — this script does not merge.
 *
 * Run once: npx tsx prisma/update-software-features.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const locales = ["th", "en", "zh"] as const;
const messagesDir = path.join(__dirname, "..", "messages");

async function main() {
  for (const locale of locales) {
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));
    const items = messages.software?.features?.items;
    if (!items) continue;

    await prisma.pageContent.upsert({
      where: { namespace_key_locale: { namespace: "software", key: "features.items", locale } },
      create: { namespace: "software", key: "features.items", locale, value: JSON.stringify(items) },
      update: { value: JSON.stringify(items) },
    });
  }
  console.log("Done: software.features.items upserted for th/en/zh.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
