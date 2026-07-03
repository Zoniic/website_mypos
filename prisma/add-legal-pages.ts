/**
 * One-off, idempotent migration: pushes the new "legal" (Privacy Policy /
 * Terms of Service) and "cookieConsent" PageContent namespaces from
 * messages/*.json into MySQL. Runtime content is DB-backed (see README),
 * so these JSON files alone don't reach the live site.
 *
 * The drafted privacy/terms copy is generic boilerplate — have it
 * reviewed by a lawyer before relying on it in production.
 *
 * Run once: npx tsx prisma/add-legal-pages.ts
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const locales = ["th", "en", "zh"] as const;
const namespaces = ["legal", "cookieConsent"] as const;
// Existing "footer" namespace just needs these 2 new keys added.
const footerKeys = ["privacyPolicy", "termsOfService"] as const;
const messagesDir = path.join(__dirname, "..", "messages");

async function main() {
  for (const locale of locales) {
    const file = path.join(messagesDir, `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));

    for (const namespace of namespaces) {
      const section = messages[namespace];
      if (!section) continue;

      for (const [key, value] of Object.entries(section)) {
        await prisma.pageContent.upsert({
          where: { namespace_key_locale: { namespace, key, locale } },
          create: { namespace, key, locale, value: String(value) },
          update: { value: String(value) },
        });
      }
    }

    for (const key of footerKeys) {
      const value = messages.footer?.[key];
      if (!value) continue;
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace: "footer", key, locale } },
        create: { namespace: "footer", key, locale, value: String(value) },
        update: { value: String(value) },
      });
    }
  }
  console.log("Done: legal + cookieConsent namespaces upserted for th/en/zh.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
