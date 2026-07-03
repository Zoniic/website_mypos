/**
 * One-off, idempotent migration: pushes the new "kb" PageContent namespace
 * (Knowledge Base landing/section/search copy) from messages/*.json into
 * MySQL, since runtime content is DB-backed (see README) and these JSON
 * files alone don't reach the live site.
 *
 * Run once: npx tsx prisma/add-kb-namespace.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const locales = ["th", "en", "zh"] as const;
const messagesDir = path.join(__dirname, "..", "messages");

function flatten(obj: unknown, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  if (obj === null || typeof obj !== "object") return result;

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object") {
      Object.assign(result, flatten(value, currentPath));
    } else {
      result[currentPath] = String(value);
    }
  }
  return result;
}

async function main() {
  for (const locale of locales) {
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));

    const kb = messages.kb;
    if (kb) {
      const flat = flatten(kb);
      for (const [key, value] of Object.entries(flat)) {
        await prisma.pageContent.upsert({
          where: { namespace_key_locale: { namespace: "kb", key, locale } },
          create: { namespace: "kb", key, locale, value },
          update: { value },
        });
      }
    }

    // Also push the new nav.knowledgeBase label (existing "nav" namespace).
    const navLabel = messages.nav?.knowledgeBase;
    if (navLabel) {
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace: "nav", key: "knowledgeBase", locale } },
        create: { namespace: "nav", key: "knowledgeBase", locale, value: navLabel },
        update: { value: navLabel },
      });
    }
  }
  console.log("Done: kb namespace + nav.knowledgeBase upserted for th/en/zh.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
