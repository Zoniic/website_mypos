/**
 * One-off, idempotent migration: adds the about.partners.eyebrow / .title
 * PageContent keys (th/en/zh) for the new Official Partners section on the
 * About page. Runtime content is DB-backed (see README), so the
 * messages/*.json change alone doesn't reach the live site.
 *
 * Run once: npx tsx prisma/add-official-partners-copy.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const values: Record<string, Record<"th" | "en" | "zh", string>> = {
  "partners.eyebrow": {
    th: "พาร์ทเนอร์อย่างเป็นทางการ",
    en: "Official Partners",
    zh: "官方合作伙伴",
  },
  "partners.title": {
    th: "พาร์ทเนอร์ที่เราได้รับการรับรองอย่างเป็นทางการ",
    en: "Authorized Partners We Work With",
    zh: "我们的官方授权合作伙伴",
  },
};

async function main() {
  for (const [key, byLocale] of Object.entries(values)) {
    for (const [locale, value] of Object.entries(byLocale)) {
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace: "about", key, locale } },
        create: { namespace: "about", key, locale, value },
        update: { value },
      });
    }
  }
  console.log("Done: about.partners.* upserted for th/en/zh.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
