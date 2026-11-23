// Read-only: lists which of the new lead columns already exist in the database.
// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/check-lead-columns.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw<{ table_name: string; column_name: string }[]>`
    SELECT table_name, column_name
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name IN ('ContactMessage', 'QuoteRequest', 'WarrantyClaim')
      AND column_name IN ('adminNote', 'assigneeId')
    ORDER BY table_name, column_name`;
  const found = rows.map((r) => `${r.table_name}.${r.column_name}`);
  console.log(`FOUND ${found.length} of 6: ${found.join(", ") || "(none)"}`);
  const counts = {
    ContactMessage: await prisma.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM "ContactMessage"`,
    QuoteRequest: await prisma.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM "QuoteRequest"`,
    WarrantyClaim: await prisma.$queryRaw<{ n: bigint }[]>`SELECT count(*) AS n FROM "WarrantyClaim"`,
  };
  for (const [table, r] of Object.entries(counts)) console.log(`rows ${table}=${String(r[0].n)}`);
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message.slice(0, 300) : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
