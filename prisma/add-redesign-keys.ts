/**
 * Idempotent migration for copy introduced by the 2026-09 visual redesign:
 * pricing.recommended (was hardcoded Thai in Pricing.tsx, so en/zh showed
 * Thai). Writes the DB and messages/*.json.
 * Run: npx tsx prisma/add-redesign-keys.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const messagesDir = path.join(__dirname, "..", "messages");
type Locale = "th" | "en" | "zh";

const CONTENT: Record<Locale, { namespace: string; key: string; value: string }[]> = {
  th: [{ namespace: "pricing", key: "recommended", value: "แนะนำ" }],
  en: [{ namespace: "pricing", key: "recommended", value: "Recommended" }],
  zh: [{ namespace: "pricing", key: "recommended", value: "推荐" }],
};

async function main() {
  for (const locale of Object.keys(CONTENT) as Locale[]) {
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));
    for (const { namespace, key, value } of CONTENT[locale]) {
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace, key, locale } },
        create: { namespace, key, locale, value },
        update: { value },
      });
      messages[namespace] = { ...messages[namespace], [key]: value };
    }
    fs.writeFileSync(file, JSON.stringify(messages, null, 2) + "\n", "utf8");
    console.log(`Updated ${locale}: DB + messages/${locale}.json`);
  }
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
