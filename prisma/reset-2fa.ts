/**
 * R4a: turns off two-step login for ONE admin account (for example when the
 * phone and the backup codes are both lost). It clears the encrypted secret,
 * the enabled date and the last-used step, deletes the account's backup
 * codes, and writes a `2fa_reset` row in the change history (source "script",
 * with the OS user name and the host) in the same transaction. The admin can
 * then sign in with the password alone and set two-step login up again.
 *
 * Needs a shell on the server with DATABASE_URL set. It never prints a secret
 * or a code.
 *
 * Safe by default: a dry run only shows the account and what would change.
 *   --write saves a JSON backup in prisma/backups/ (gitignored; the encrypted
 *   secret blob only, never a plain secret) and then makes the change.
 *
 * Run:
 *   node node_modules/tsx/dist/cli.mjs prisma/reset-2fa.ts --email admin@example.com           (dry run)
 *   node node_modules/tsx/dist/cli.mjs prisma/reset-2fa.ts --email admin@example.com --write   (reset)
 *   node node_modules/tsx/dist/cli.mjs prisma/reset-2fa.ts --self-test                         (no database)
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { recordAudit, type AuditClient, type AuditEntry } from "../src/lib/audit";

export const RESET_ACTOR = "script:reset-2fa";

export type ResetArgs = { email: string | null; write: boolean; selfTest: boolean };

export function parseArgs(argv: string[]): ResetArgs {
  const args: ResetArgs = { email: null, write: false, selfTest: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--write") args.write = true;
    else if (arg === "--self-test") args.selfTest = true;
    else if (arg === "--email") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) throw new Error("--email needs an address");
      args.email = value.trim().toLowerCase();
      i++;
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!args.selfTest && !args.email) throw new Error("--email <address> is required");
  return args;
}

/** The change-history row for a reset. Names the OS user and host, never a secret. */
export function buildResetEntry(input: {
  userId: number;
  email: string;
  backupCodes: number;
  osUser: string;
  host: string;
}): AuditEntry {
  return {
    actor: { id: null, email: RESET_ACTOR, name: RESET_ACTOR },
    action: "2fa_reset",
    entityType: "AdminUser",
    entityId: String(input.userId),
    entityLabel: input.email,
    source: "script",
    detail: `สคริปต์ reset-2fa, ผู้ใช้ระบบ ${input.osUser}, เครื่อง ${input.host}, ลบรหัสสำรอง ${input.backupCodes} ชุด`,
    changes: [],
  };
}

async function selfTest() {
  assert.deepEqual(parseArgs(["--email", "A@Example.com"]), { email: "a@example.com", write: false, selfTest: false });
  assert.equal(parseArgs(["--email", "a@b.co", "--write"]).write, true);
  assert.equal(parseArgs(["--self-test"]).selfTest, true);
  assert.throws(() => parseArgs([]), /--email/);
  assert.throws(() => parseArgs(["--email"]), /--email/);
  assert.throws(() => parseArgs(["--email", "--write"]), /--email/);
  assert.throws(() => parseArgs(["--email", "a@b.co", "--oops"]), /Unknown/);

  const entry = buildResetEntry({ userId: 4, email: "a@b.co", backupCodes: 9, osUser: "ops", host: "box1" });
  assert.equal(entry.action, "2fa_reset");
  assert.equal(entry.source, "script");
  assert.equal(entry.actor.email, RESET_ACTOR);
  assert.equal(entry.entityId, "4");
  assert.match(entry.detail ?? "", /ops/);
  assert.match(entry.detail ?? "", /box1/);

  let written: Record<string, unknown> | undefined;
  const fake: AuditClient = {
    auditLog: {
      create: async (args) => {
        written = args.data;
        return {};
      },
      deleteMany: async () => ({ count: 0 }),
    },
  };
  assert.equal(await recordAudit(fake, entry, { transactional: true }), true);
  assert.equal(written?.action, "2fa_reset");
  assert.equal(written?.source, "script");
  console.log("self-test passed");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selfTest) return selfTest();
  const email = args.email as string;
  const prisma = new PrismaClient();
  try {
    const user = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, totpSecretEnc: true, totpEnabledAt: true, totpLastStep: true },
    });
    if (!user) {
      console.error(`No admin account with this email: ${email}`);
      process.exitCode = 1;
      return;
    }
    const backupCodes = await prisma.adminBackupCode.count({ where: { adminUserId: user.id } });
    console.log(`Account: ${user.email} (${user.name}, ${user.role})`);
    console.log(`Two-step login: ${user.totpEnabledAt ? "on" : "off"}, secret stored: ${user.totpSecretEnc ? "yes" : "no"}, backup codes: ${backupCodes}`);
    if (!user.totpEnabledAt && !user.totpSecretEnc && backupCodes === 0) {
      console.log("Nothing to reset.");
      return;
    }
    if (!args.write) {
      console.log("Dry run: nothing changed. It would clear the secret, the enabled date and the last step, delete the backup codes, and write a 2fa_reset row in the change history. Re-run with --write.");
      return;
    }
    const dir = path.join(__dirname, "backups");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `reset-2fa-${user.id}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(
      file,
      JSON.stringify({ userId: user.id, email: user.email, totpSecretEnc: user.totpSecretEnc, totpEnabledAt: user.totpEnabledAt, totpLastStep: user.totpLastStep, backupCodes }, null, 2),
    );
    const entry = buildResetEntry({ userId: user.id, email: user.email, backupCodes, osUser: os.userInfo().username, host: os.hostname() });
    await prisma.$transaction(async (tx) => {
      await tx.adminUser.update({ where: { id: user.id }, data: { totpSecretEnc: null, totpEnabledAt: null, totpLastStep: null } });
      await tx.adminBackupCode.deleteMany({ where: { adminUserId: user.id } });
      await recordAudit(tx as unknown as AuditClient, entry, { transactional: true });
    });
    console.log(`done. Backup saved as ${path.basename(file)}. ${user.email} can now sign in with the password alone.`);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : "reset-2fa failed");
    process.exit(1);
  });
}
