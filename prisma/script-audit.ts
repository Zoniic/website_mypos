import os from "node:os";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { recordScriptAudit, type AuditClient } from "../src/lib/audit";

/**
 * One summary row in the change history for a data script that ran with
 * --write (script name, rows changed, backup file name, host, OS user). Never
 * stops the script: if the table does not exist yet it only prints a warning.
 */
export async function auditScriptRun(prisma: PrismaClient, script: string, rows: number, backupFile?: string | null): Promise<void> {
  await recordScriptAudit(prisma as unknown as AuditClient, {
    script,
    rows,
    backupFile: backupFile ? path.basename(backupFile) : null,
    host: os.hostname(),
    osUser: os.userInfo().username,
  });
}
