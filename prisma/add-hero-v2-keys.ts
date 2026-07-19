/**
 * One-off, idempotent migration: pushes the new home.hero keys added for
 * the full-screen hero redesign (tagline, headlineLine1/2, missionStatement,
 * statHeadline) from messages/*.json into MySQL.
 *
 * Run once: npx tsx prisma/add-hero-v2-keys.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const locales = ["th", "en", "zh"] as const;
const keys = ["tagline", "headlineLine1", "headlineLine2", "missionStatement", "statHeadline"];
const messagesDir = path.join(__dirname, "..", "messages");

async function main() {
  for (const locale of locales) {
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));
    const section = messages.home?.hero;
    if (!section) continue;

    for (const key of keys) {
      const value = section[key];
      if (value === undefined) continue;
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace: "home", key: `hero.${key}`, locale } },
        create: { namespace: "home", key: `hero.${key}`, locale, value: String(value) },
        update: { value: String(value) },
      });
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
