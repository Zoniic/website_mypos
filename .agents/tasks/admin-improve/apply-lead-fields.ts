// Applies .agents/tasks/admin-improve/lead-fields.sql (approved by the owner) in ONE transaction
// with a lock timeout, through the normal Prisma connection. Refuses to run if the file contains
// anything other than ALTER TABLE / CREATE INDEX statements, or if any new column already exists.
// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/apply-lead-fields.ts
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  const file = path.join(process.cwd(), ".agents", "tasks", "admin-improve", "lead-fields.sql");
  const statements = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  // Only additive statements: ADD COLUMN, ADD CONSTRAINT, CREATE INDEX. ("ON UPDATE CASCADE"
  // inside a foreign key is allowed; a DROP, DELETE, TRUNCATE or INSERT anywhere is not.)
  const allowed = /^(ALTER TABLE "\w+" ADD (COLUMN|CONSTRAINT)|CREATE INDEX)\b/i;
  const forbidden = /\b(DROP|DELETE|TRUNCATE|INSERT)\b|^UPDATE\b|\bSET\s+DATA\b/i;
  for (const s of statements) {
    // Foreign-key actions ("ON DELETE SET NULL", "ON UPDATE CASCADE") are part of the constraint, not statements.
    const checked = s.replace(/\bON (DELETE|UPDATE) (SET NULL|CASCADE|RESTRICT|NO ACTION)\b/gi, "");
    if (!allowed.test(s) || forbidden.test(checked)) throw new Error(`Refusing statement: ${s.slice(0, 80)}`);
  }
  console.log(`${statements.length} statements, all ALTER TABLE or CREATE INDEX`);

  const existing = await prisma.$queryRaw<{ n: bigint }[]>`
    SELECT count(*) AS n FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name IN ('ContactMessage', 'QuoteRequest', 'WarrantyClaim')
      AND column_name IN ('adminNote', 'assigneeId')`;
  if (Number(existing[0].n) !== 0) throw new Error("New columns already exist, not applying");

  await prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL lock_timeout = '15s'");
      for (const s of statements) {
        await tx.$executeRawUnsafe(s);
        console.log("OK", s.split("\n")[0].slice(0, 90));
      }
    },
    { timeout: 120000, maxWait: 20000 }
  );
  console.log("COMMITTED");
}

main()
  .catch((e) => {
    console.error("ERROR (transaction rolled back)", e instanceof Error ? e.message.slice(0, 400) : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
