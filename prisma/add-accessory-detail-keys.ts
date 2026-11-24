/**
 * Adds the "accessoryDetail" copy (accessory detail page, accessories strip on
 * product pages, type column of the quote list) in th/en/zh to PageContent and
 * messages/*.json. Values come from src/data/accessoryCopy.ts. Create-only: an
 * existing DB row (for example one edited in the admin) is never overwritten.
 *
 * Dry run by default. --write saves a JSON backup of the matching rows (none
 * expected) to prisma/backups/ first, then inserts the missing rows.
 * Run: node node_modules/tsx/dist/cli.mjs prisma/add-accessory-detail-keys.ts [--write]
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { ACCESSORY_COPY, ACCESSORY_COPY_NAMESPACE } from "../src/data/accessoryCopy";

const prisma = new PrismaClient();
const NAMESPACE = ACCESSORY_COPY_NAMESPACE;
type Locale = keyof typeof ACCESSORY_COPY;
const LOCALES = Object.keys(ACCESSORY_COPY) as Locale[];

async function main() {
  const write = process.argv.includes("--write");
  const wanted = LOCALES.flatMap((locale) =>
    Object.entries(ACCESSORY_COPY[locale]).map(([key, value]) => ({ namespace: NAMESPACE, key, locale, value })),
  );
  const existing = await prisma.pageContent.findMany({ where: { namespace: NAMESPACE } });
  const missing = wanted.filter((w) => !existing.some((r) => r.key === w.key && r.locale === w.locale));
  console.log(`existing rows: ${existing.length}`);
  console.log(`to insert: ${missing.length} (${missing.map((m) => `${m.locale}.${m.key}`).join(", ") || "nothing"})`);

  // The seed files are kept in step (they are not read at runtime).
  for (const locale of LOCALES) {
    const file = path.join(process.cwd(), "messages", `${locale}.json`);
    const messages = JSON.parse(fs.readFileSync(file, "utf8"));
    const current = messages[NAMESPACE] ?? {};
    const next = { ...ACCESSORY_COPY[locale], ...current };
    if (JSON.stringify(current) !== JSON.stringify(next) && write) {
      messages[NAMESPACE] = next;
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
  const backup = path.join(dir, `add-accessory-detail-keys-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(backup, JSON.stringify({ existing }, null, 2), "utf8");
  console.log(`backup: ${path.basename(backup)}`);
  await prisma.pageContent.createMany({ data: missing, skipDuplicates: true });
  console.log(`inserted ${missing.length} rows. The site shows them within 5 minutes (cache).`);
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
