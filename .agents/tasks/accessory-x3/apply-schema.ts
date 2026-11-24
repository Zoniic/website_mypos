// Applies .agents/tasks/accessory-x3/accessory-x3-schema.sql to the database in DATABASE_URL,
// in ONE transaction with a lock timeout. Raw SQL only, so it runs before and after the change.
//   --check   read-only: report which new columns/table exist and the row counts
//   --backup  read-only on the DB: save Accessory and AccessoryTranslation rows to prisma/backups/
//   --apply   refuse unless every statement is additive and nothing new exists yet, then apply
// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/accessory-x3/apply-schema.ts --check
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const NEW_ACCESSORY_COLUMNS = ["datasheetUrl", "galleryUrls", "leadTimeDays", "priceFrom", "stockStatus", "videoUrl"];

async function state() {
  const cols = await prisma.$queryRaw<{ table_name: string; column_name: string }[]>`
    SELECT table_name, column_name FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND ((table_name = 'Accessory' AND column_name IN ('datasheetUrl', 'galleryUrls', 'leadTimeDays', 'priceFrom', 'stockStatus', 'videoUrl'))
        OR (table_name = 'AccessoryTranslation' AND column_name = 'specs'))`;
  const tables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = '_AccessoryCompatibleProducts'`;
  const counts = await prisma.$queryRaw<{ a: bigint; t: bigint; p: bigint }[]>`
    SELECT (SELECT count(*) FROM "Accessory") AS a, (SELECT count(*) FROM "AccessoryTranslation") AS t, (SELECT count(*) FROM "Product") AS p`;
  return {
    cols: cols.map((c) => `${c.table_name}.${c.column_name}`).sort(),
    tables: tables.map((t) => t.table_name),
    accessories: Number(counts[0].a),
    translations: Number(counts[0].t),
    products: Number(counts[0].p),
  };
}

async function main() {
  const mode = process.argv[2];
  const s = await state();
  console.log(
    `STATE new columns=${s.cols.length}/${NEW_ACCESSORY_COLUMNS.length + 1} [${s.cols.join(",")}] new table=${s.tables.length}/1 ` +
      `accessories=${s.accessories} translations=${s.translations} products=${s.products}`,
  );
  if (mode === "--check") return;

  if (mode === "--backup") {
    const accessories = await prisma.$queryRaw<unknown[]>`SELECT * FROM "Accessory" ORDER BY id`;
    const translations = await prisma.$queryRaw<unknown[]>`SELECT * FROM "AccessoryTranslation" ORDER BY id`;
    const categories = await prisma.$queryRaw<unknown[]>`SELECT * FROM "_AccessoryToCategory" ORDER BY "A", "B"`;
    const dir = path.join(process.cwd(), "prisma", "backups");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `accessory-x3-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(
      file,
      JSON.stringify({ createdAt: new Date().toISOString(), note: "Accessory rows before accessory-x3-schema.sql", accessories, translations, categories }, null, 2),
      "utf8",
    );
    console.log(`BACKUP ${path.basename(file)} accessories=${accessories.length} translations=${translations.length} categoryLinks=${categories.length}`);
    return;
  }

  if (mode !== "--apply") throw new Error("Use --check, --backup or --apply");
  if (s.cols.length || s.tables.length) throw new Error("Some new objects already exist; not applying");

  const sql = fs.readFileSync(path.join(process.cwd(), ".agents", "tasks", "accessory-x3", "accessory-x3-schema.sql"), "utf8");
  const statements = sql
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((x) => x.trim())
    .filter(Boolean);
  const allowed = /^(ALTER TABLE "\w+" ADD (COLUMN|CONSTRAINT)|CREATE TABLE "\w+"|CREATE (UNIQUE )?INDEX)\s/i;
  const forbidden = /\b(DROP|DELETE|TRUNCATE|INSERT|ALTER COLUMN|RENAME)\b|^UPDATE\b/i;
  for (const st of statements) {
    const checked = st.replace(/\bON (DELETE|UPDATE) (SET NULL|CASCADE|RESTRICT|NO ACTION)\b/gi, "");
    if (!allowed.test(st) || forbidden.test(checked)) throw new Error(`Refusing statement: ${st.slice(0, 90)}`);
  }
  console.log(`${statements.length} statements, all additive`);

  await prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL lock_timeout = '15s'");
      for (const st of statements) {
        await tx.$executeRawUnsafe(st);
        console.log("OK", st.split("\n")[0].slice(0, 90));
      }
    },
    { timeout: 120000, maxWait: 20000 },
  );
  console.log("COMMITTED");
  const after = await state();
  console.log(
    `AFTER new columns=${after.cols.length}/${NEW_ACCESSORY_COLUMNS.length + 1} new table=${after.tables.length}/1 ` +
      `accessories=${after.accessories} translations=${after.translations} products=${after.products}`,
  );
}

main()
  .catch((e) => {
    console.error("ERROR (nothing applied if this happened before COMMITTED)", e instanceof Error ? e.message.slice(0, 400) : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
