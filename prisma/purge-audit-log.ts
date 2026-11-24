/**
 * Deletes change-history rows (AuditLog) older than one year (365 days).
 * The admin also does this by itself at most once a day while it runs; use
 * this script from a host cron when you want it on a fixed schedule.
 *
 * Safe by default: a dry run only counts the rows older than the cutoff.
 *
 * Run:
 *   node node_modules/tsx/dist/cli.mjs prisma/purge-audit-log.ts               (dry run)
 *   node node_modules/tsx/dist/cli.mjs prisma/purge-audit-log.ts --write       (delete)
 *   node node_modules/tsx/dist/cli.mjs prisma/purge-audit-log.ts --self-test   (no database)
 */
import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { AUDIT_RETENTION_DAYS, purgeExpiredAudit, resetPurgeThrottle, retentionCutoff, type AuditClient } from "../src/lib/audit";

async function selfTest() {
  const now = new Date("2026-06-01T00:00:00.000Z");
  assert.equal(now.getTime() - retentionCutoff(now).getTime(), AUDIT_RETENTION_DAYS * 86_400_000);
  let seen: Date | undefined;
  const fake: AuditClient = {
    auditLog: {
      create: async () => ({}),
      deleteMany: async (args) => {
        seen = args.where.createdAt.lt;
        return { count: 3 };
      },
    },
  };
  resetPurgeThrottle();
  assert.equal(await purgeExpiredAudit(fake, now, { force: true }), 3);
  assert.equal(seen?.getTime(), retentionCutoff(now).getTime());
  console.log("self-test passed");
}

async function main() {
  if (process.argv.includes("--self-test")) return selfTest();
  const write = process.argv.includes("--write");
  const prisma = new PrismaClient();
  try {
    const cutoff = retentionCutoff();
    const old = await prisma.auditLog.count({ where: { createdAt: { lt: cutoff } } });
    console.log(`History rows older than ${cutoff.toISOString()}: ${old}`);
    if (!write) {
      console.log("Dry run: nothing deleted. Re-run with --write to delete them.");
      return;
    }
    const deleted = await purgeExpiredAudit(prisma as unknown as AuditClient, new Date(), { force: true });
    console.log(deleted === null ? "Purge failed (see the message above)." : `Deleted ${deleted} rows.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
