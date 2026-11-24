/**
 * Adds the short label of the header quote-list button (nav.compareShort) in
 * th/en/zh to PageContent and messages/*.json. Create-only: an existing DB row
 * (for example one edited in the admin) is never overwritten.
 *
 * Dry run by default. --write saves a JSON backup of the matching rows (none
 * expected) to prisma/backups/ first, then inserts the missing rows.
 * Run: node node_modules/tsx/dist/cli.mjs prisma/add-nav-compare-short.ts [--write]
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const VALUES = { th: "ใบเสนอราคา", en: "Quote", zh: "报价" } as const;
const NAMESPACE = "nav";
const KEY = "compareShort";

async function main() {
  const write = process.argv.includes("--write");
  const existing = await prisma.pageContent.findMany({ where: { namespace: NAMESPACE, key: KEY } });
  const missing = (Object.keys(VALUES) as (keyof typeof VALUES)[]).filter((l) => !existing.some((r) => r.locale === l));
  console.log(`existing rows: ${existing.map((r) => `${r.locale}="${r.value}"`).join(", ") || "none"}`);
  console.log(`to insert: ${missing.join(", ") || "nothing"}`);

  // The seed files are always kept in step (they are not read at runtime).
  for (const locale of Object.keys(VALUES) as (keyof typeof VALUES)[]) {
    const file = path.join(process.cwd(), "messages", `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));
    if (messages.nav?.[KEY] !== VALUES[locale] && write) {
      messages.nav = { ...messages.nav, [KEY]: VALUES[locale] };
      fs.writeFileSync(file, JSON.stringify(messages, null, 2) + "\n", "utf8");
      console.log(`messages/${locale}.json updated`);
    }
  }

  if (!write) {
    console.log("Dry run: nothing written. Re-run with --write.");
    return;
  }
  if (missing.length === 0) return;
  const dir = path.join(process.cwd(), "prisma", "backups");
  fs.mkdirSync(dir, { recursive: true });
  const backup = path.join(dir, `add-nav-compare-short-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(backup, JSON.stringify({ existing }, null, 2), "utf8");
  console.log(`backup: ${path.basename(backup)}`);
  await prisma.pageContent.createMany({
    data: missing.map((locale) => ({ namespace: NAMESPACE, key: KEY, locale, value: VALUES[locale] })),
    skipDuplicates: true,
  });
  console.log(`inserted ${missing.length} rows. The site shows them within 5 minutes (cache).`);
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
