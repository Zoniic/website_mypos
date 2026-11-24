import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { recordAudit, type AuditAction, type AuditClient } from "@/lib/audit";
import { BACKUP_CODE_COUNT, generateBackupCodes, hashBackupCode, normalizeBackupCode } from "@/lib/backupCodes";
import { checkActingPassword } from "@/lib/adminUsers";
import { clearAttempts, isRateLimited, recordAttempt } from "@/lib/rateLimit";
import { decryptSecret, encryptSecret, getEncryptionKey, isEncryptionConfigured } from "@/lib/secretBox";
import { generateSecret, otpauthUri, verifyTotp } from "@/lib/totp";
import { TWO_FACTOR_MESSAGES, classifyCode, formatManualKey, twoFactorUserKey } from "@/lib/twoFactorPure";

/**
 * Server-side glue for the two-step login. Secrets are encrypted with
 * AES-256-GCM (AAD `totp:<userId>`), backup codes are stored only as keyed
 * hashes, and nothing here logs a code, a secret or a key.
 */

/** A problem with a Thai message that is safe to show to the admin. */
export class TwoFactorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TwoFactorError";
  }
}

type Actor = { userId: number; email: string; name: string };
type Db = typeof prisma;

const ISSUER = "MYPOS";
const aadOf = (userId: number) => `totp:${userId}`;

function encryptionKey(): Buffer {
  if (!isEncryptionConfigured()) throw new TwoFactorError(TWO_FACTOR_MESSAGES.notConfigured);
  return getEncryptionKey();
}

function readSecret(blob: string, userId: number, key: Buffer): string {
  try {
    return decryptSecret(blob, aadOf(userId), key);
  } catch {
    throw new TwoFactorError(TWO_FACTOR_MESSAGES.keyMismatch);
  }
}

function auditTwoFactor(actor: Actor, action: AuditAction, db: Db | typeof prisma, detail: string) {
  return recordAudit(
    db as unknown as AuditClient,
    {
      actor: { id: actor.userId, email: actor.email, name: actor.name },
      action,
      entityType: "AdminUser",
      entityId: String(actor.userId),
      entityLabel: actor.email,
      detail,
      changes: [],
    },
    { transactional: true },
  );
}

export type PendingEnrollment = { qrDataUrl: string; manualKey: string };

/** True when this server can store and read two-step secrets. */
export const twoFactorAvailable = () => isEncryptionConfigured();

/** Starts setup: stores a fresh encrypted secret for the account. Two-step login stays off until a code is confirmed. */
export async function beginEnrollment(actor: Actor): Promise<void> {
  const key = encryptionKey();
  const row = await prisma.adminUser.findUnique({ where: { id: actor.userId }, select: { totpEnabledAt: true } });
  if (!row) throw new TwoFactorError(TWO_FACTOR_MESSAGES.expired);
  if (row.totpEnabledAt) throw new TwoFactorError("เปิดรหัส 2 ขั้นตอนไว้แล้ว");
  const secret = generateSecret();
  await prisma.adminUser.updateMany({
    where: { id: actor.userId, totpEnabledAt: null },
    data: { totpSecretEnc: encryptSecret(secret, aadOf(actor.userId), key), totpLastStep: null },
  });
}

/** The QR image and manual key of a setup that was started and not yet confirmed, or null. */
export async function getPendingEnrollment(actor: Actor): Promise<PendingEnrollment | null> {
  if (!isEncryptionConfigured()) return null;
  const row = await prisma.adminUser.findUnique({
    where: { id: actor.userId },
    select: { totpSecretEnc: true, totpEnabledAt: true },
  });
  if (!row?.totpSecretEnc || row.totpEnabledAt) return null;
  let secret: string;
  try {
    secret = readSecret(row.totpSecretEnc, actor.userId, getEncryptionKey());
  } catch {
    return null;
  }
  const qrDataUrl = await QRCode.toDataURL(otpauthUri({ issuer: ISSUER, account: actor.email, secret }), {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 220,
  });
  return { qrDataUrl, manualKey: formatManualKey(secret) };
}

/**
 * Confirms the first code from the app, turns two-step login on and returns
 * the ten backup codes in plain text. They are shown once and never stored in
 * plain text. The change and its history row are one transaction.
 */
export async function confirmEnrollment(actor: Actor, code: string): Promise<string[]> {
  const key = encryptionKey();
  const limitKey = twoFactorUserKey(actor.userId);
  if (isRateLimited(limitKey)) throw new TwoFactorError(TWO_FACTOR_MESSAGES.tooMany);
  const row = await prisma.adminUser.findUnique({
    where: { id: actor.userId },
    select: { totpSecretEnc: true, totpEnabledAt: true, totpLastStep: true },
  });
  if (!row?.totpSecretEnc || row.totpEnabledAt) throw new TwoFactorError("ยังไม่ได้เริ่มตั้งค่า กรุณาเริ่มใหม่");
  const secret = readSecret(row.totpSecretEnc, actor.userId, key);
  const step = verifyTotp(secret, code, { lastStep: row.totpLastStep });
  if (step === null) {
    recordAttempt(limitKey);
    throw new TwoFactorError(TWO_FACTOR_MESSAGES.wrongCode);
  }
  const codes = generateBackupCodes();
  const hashes = codes.map((c) => hashBackupCode(c, key));
  await prisma.$transaction(async (tx) => {
    const done = await tx.adminUser.updateMany({
      where: { id: actor.userId, totpEnabledAt: null },
      data: { totpEnabledAt: new Date(), totpLastStep: step },
    });
    if (done.count !== 1) throw new TwoFactorError("เปิดรหัส 2 ขั้นตอนไว้แล้ว");
    await tx.adminBackupCode.deleteMany({ where: { adminUserId: actor.userId } });
    await tx.adminBackupCode.createMany({ data: hashes.map((codeHash) => ({ adminUserId: actor.userId, codeHash })) });
    await auditTwoFactor(actor, "2fa_enable", tx as unknown as Db, `สร้างรหัสสำรอง ${BACKUP_CODE_COUNT} ชุด`);
  });
  clearAttempts(limitKey);
  return codes;
}

/**
 * Checks a typed code for this account and consumes it: an app code is
 * accepted once (the last used 30-second step is moved forward in one
 * conditional update), a backup code is accepted once (usedAt is set in one
 * conditional update). Returns which kind was used, or null.
 * Callers do the rate limiting.
 */
export async function consumeLoginCode(userId: number, input: string): Promise<"totp" | "backup" | null> {
  const kind = classifyCode(input);
  if (!kind) return null;
  const key = encryptionKey();
  const row = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { totpSecretEnc: true, totpEnabledAt: true, totpLastStep: true },
  });
  if (!row?.totpEnabledAt || !row.totpSecretEnc) return null;
  if (kind === "totp") {
    const secret = readSecret(row.totpSecretEnc, userId, key);
    const step = verifyTotp(secret, input, { lastStep: row.totpLastStep });
    if (step === null) return null;
    const moved = await prisma.adminUser.updateMany({
      where: { id: userId, OR: [{ totpLastStep: null }, { totpLastStep: { lt: step } }] },
      data: { totpLastStep: step },
    });
    return moved.count === 1 ? "totp" : null;
  }
  const used = await prisma.adminBackupCode.updateMany({
    where: { adminUserId: userId, codeHash: hashBackupCode(normalizeBackupCode(input), key), usedAt: null },
    data: { usedAt: new Date() },
  });
  return used.count === 1 ? "backup" : null;
}

/** Number of backup codes of this account that were not used yet. */
export async function unusedBackupCodeCount(userId: number): Promise<number> {
  return prisma.adminBackupCode.count({ where: { adminUserId: userId, usedAt: null } });
}

/**
 * Turns two-step login off for the signed-in admin. Needs the account
 * password and a current code (an app code or a backup code). Wrong tries
 * count on the same per-account budgets as the login.
 */
export async function disableTwoFactor(actor: Actor, password: string, code: string): Promise<void> {
  const limitKey = twoFactorUserKey(actor.userId);
  if (isRateLimited(limitKey)) throw new TwoFactorError(TWO_FACTOR_MESSAGES.tooMany);
  const passwordError = await checkActingPassword(actor.userId, password);
  if (passwordError) throw new TwoFactorError(passwordError);
  const used = await consumeLoginCode(actor.userId, code);
  if (!used) {
    recordAttempt(limitKey);
    throw new TwoFactorError(TWO_FACTOR_MESSAGES.wrongCode);
  }
  await prisma.$transaction(async (tx) => {
    await tx.adminUser.update({
      where: { id: actor.userId },
      data: { totpSecretEnc: null, totpEnabledAt: null, totpLastStep: null },
    });
    await tx.adminBackupCode.deleteMany({ where: { adminUserId: actor.userId } });
    await auditTwoFactor(actor, "2fa_disable", tx as unknown as Db, "ปิดรหัส 2 ขั้นตอนด้วยรหัสผ่านและรหัสจากแอป");
  });
  clearAttempts(limitKey);
}
