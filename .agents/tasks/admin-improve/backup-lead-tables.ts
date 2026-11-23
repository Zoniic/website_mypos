// Read-only: saves the three tables that the lead-fields.sql migration alters,
// using raw SQL so it works before the new columns exist (prisma/backup-db.ts
// needs the new schema). Output: prisma/backups/lead-tables-<timestamp>.json (gitignored).
// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/backup-lead-tables.ts
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  const data = {
    ContactMessage: await prisma.$queryRaw<unknown[]>`SELECT * FROM "ContactMessage" ORDER BY id`,
    QuoteRequest: await prisma.$queryRaw<unknown[]>`SELECT * FROM "QuoteRequest" ORDER BY id`,
    QuoteRequestItem: await prisma.$queryRaw<unknown[]>`SELECT * FROM "QuoteRequestItem" ORDER BY id`,
    WarrantyClaim: await prisma.$queryRaw<unknown[]>`SELECT * FROM "WarrantyClaim" ORDER BY id`,
  };
  const dir = path.join(process.cwd(), "prisma", "backups");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `lead-tables-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  const text = JSON.stringify(
    { createdAt: new Date().toISOString(), counts: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])), data },
    (_k, v) => (typeof v === "bigint" ? v.toString() : v),
    2
  );
  fs.writeFileSync(file, text, "utf8");
  console.log(`BACKUP ${path.basename(file)} bytes=${text.length} counts=${JSON.stringify(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])))}`);
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message.slice(0, 300) : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
