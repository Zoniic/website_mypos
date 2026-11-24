// Copies public site content from SOURCE_URL (read-only SELECTs) into the scratch DB in DATABASE_URL.
// Refuses unless DATABASE_URL is the local scratch server (localhost:5433). Lead, order, admin and
// history tables are NOT copied (no customer data or password hashes leave the shared DB).
import { PrismaClient } from "@prisma/client";

const target = process.env.DATABASE_URL ?? "";
const source = process.env.SOURCE_URL ?? "";
if (!/@(localhost|127\.0\.0\.1):5433\//.test(target)) {
  console.error("Refusing: DATABASE_URL is not the scratch server");
  process.exit(1);
}
if (!source || source === target) {
  console.error("Refusing: SOURCE_URL missing");
  process.exit(1);
}

const SKIP = new Set([
  "AdminUser", "AdminBackupCode", "AuditLog", "ContactMessage", "QuoteRequest", "QuoteRequestItem",
  "WarrantyClaim", "Order", "OrderItem", "NewsletterSubscriber", "_prisma_migrations",
]);

const src = new PrismaClient({ datasourceUrl: source });
const dst = new PrismaClient({ datasourceUrl: target });

async function main() {
  const tables = (
    await src.$queryRaw<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = current_schema() AND table_type = 'BASE TABLE' ORDER BY table_name`
  )
    .map((t) => t.table_name)
    .filter((t) => !SKIP.has(t));

  await dst.$executeRawUnsafe("SET session_replication_role = replica");
  for (const table of tables) {
    const dstCols = new Set(
      (
        await dst.$queryRaw<{ column_name: string }[]>`
          SELECT column_name FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = ${table}`
      ).map((c) => c.column_name),
    );
    if (dstCols.size === 0) {
      console.log(`skip ${table} (not in scratch schema)`);
      continue;
    }
    const rows = await src.$queryRawUnsafe<Record<string, unknown>[]>(`SELECT * FROM "${table}"`);
    await dst.$executeRawUnsafe(`DELETE FROM "${table}"`);
    for (const row of rows) {
      const cols = Object.keys(row).filter((c) => dstCols.has(c));
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
      const values = cols.map((c) => {
        const v = row[c];
        return v !== null && typeof v === "object" && !(v instanceof Date) ? JSON.stringify(v) : v;
      });
      await dst.$executeRawUnsafe(
        `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${placeholders})`,
        ...values,
      );
    }
    if (dstCols.has("id")) {
      await dst.$executeRawUnsafe(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 0) + 1, false)`,
      );
    }
    console.log(`${table}: ${rows.length}`);
  }
  await dst.$executeRawUnsafe("SET session_replication_role = DEFAULT");
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message.slice(0, 500) : e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await src.$disconnect();
    await dst.$disconnect();
  });
