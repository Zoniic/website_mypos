// Applies .agents/tasks/admin-v2/admin-v2-schema.sql (approved by the owner on 2026-11-24) to the
// database in DATABASE_URL, in ONE transaction with a lock timeout.
//   --check   read-only: report which new columns/tables exist, admin count and roles
//   --backup  read-only on the DB: save AdminUser rows (without passwordHash) to prisma/backups/
//   --apply   refuse unless every statement is additive and nothing new exists yet, then apply
// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-v2/apply-schema.ts --check
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function state() {
  const cols = await prisma.$queryRaw<{ column_name: string }[]>`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = current_schema() AND table_name = 'AdminUser'
      AND column_name IN ('role', 'totpEnabledAt', 'totpLastStep', 'totpSecretEnc')`;
  const tables = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name IN ('AuditLog', 'AdminBackupCode')`;
  const admins = await prisma.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM "AdminUser"`;
  return { cols: cols.map((c) => c.column_name).sort(), tables: tables.map((t) => t.table_name).sort(), admins: Number(admins[0].n) };
}

async function main() {
  const mode = process.argv[2];
  const s = await state();
  console.log(`STATE adminUser new columns=${s.cols.length}/4 [${s.cols.join(",")}] new tables=${s.tables.length}/2 [${s.tables.join(",")}] admins=${s.admins}`);
  if (s.cols.includes("role")) {
    const roles = await prisma.$queryRaw<{ role: string; n: bigint }[]>`SELECT role, count(*) AS n FROM "AdminUser" GROUP BY role ORDER BY role`;
    console.log("ROLES " + roles.map((r) => `${r.role}=${r.n}`).join(" "));
  }
  if (mode === "--check") return;

  if (mode === "--backup") {
    const rows = await prisma.$queryRaw<unknown[]>`SELECT id, email, name, "createdAt", "updatedAt", "lastLoginAt" FROM "AdminUser" ORDER BY id`;
    const dir = path.join(process.cwd(), "prisma", "backups");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `admin-v2-before-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(file, JSON.stringify({ createdAt: new Date().toISOString(), note: "AdminUser rows before admin-v2-schema.sql (passwordHash excluded on purpose)", rows }, null, 2), "utf8");
    console.log(`BACKUP ${path.basename(file)} rows=${rows.length}`);
    return;
  }

  if (mode !== "--apply") throw new Error("Use --check, --backup or --apply");
  if (s.cols.length || s.tables.length) throw new Error("Some new objects already exist; not applying");

  const sql = fs.readFileSync(path.join(process.cwd(), ".agents", "tasks", "admin-v2", "admin-v2-schema.sql"), "utf8");
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
  console.log(`AFTER new columns=${after.cols.length}/4 new tables=${after.tables.length}/2 admins=${after.admins}`);
}

main()
  .catch((e) => {
    console.error("ERROR (nothing applied if this happened before COMMITTED)", e instanceof Error ? e.message.slice(0, 400) : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
