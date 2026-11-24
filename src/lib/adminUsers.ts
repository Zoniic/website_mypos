import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { clearAttempts, isRateLimited, recordAttempt } from "@/lib/rateLimit";
import { wouldLeaveNoOwner, type OwnerChange } from "@/lib/lastOwner";
import type { Role } from "@/lib/permissions";

export { wouldLeaveNoOwner };

/** Thrown inside the owner transaction to roll it back with a Thai message. */
export class AdminUserRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminUserRuleError";
  }
}

export const LAST_OWNER_MESSAGE = "ต้องมีเจ้าของอย่างน้อย 1 คนเสมอ ลดบทบาทหรือลบเจ้าของคนสุดท้ายไม่ได้";

/**
 * Checks the acting admin's own current password before a sensitive change
 * (email, password or role of any account). Wrong tries are counted per acting
 * account (5 per 15 minutes), so a stolen session cannot be used to guess it.
 * Returns a Thai error message, or null when the password is right.
 */
export async function checkActingPassword(actorId: number, password: string): Promise<string | null> {
  const key = `pw:user:${actorId}`;
  if (isRateLimited(key)) return "ใส่รหัสผ่านผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่";
  if (!password) return "กรุณาใส่รหัสผ่านปัจจุบันของคุณเพื่อยืนยัน";
  const actor = await prisma.adminUser.findUnique({ where: { id: actorId }, select: { passwordHash: true } });
  const ok = actor ? await bcrypt.compare(password, actor.passwordHash) : false;
  if (!ok) {
    recordAttempt(key);
    return "รหัสผ่านปัจจุบันไม่ถูกต้อง ยังไม่ได้บันทึก";
  }
  clearAttempts(key);
  return null;
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Runs `apply` in a transaction that first locks every owner row, then
 * refuses the change when it would leave no owner. Two owners demoting each
 * other at the same moment are serialized by the lock, so one of them fails.
 */
export async function withOwnerGuard<T>(change: OwnerChange, apply: (tx: Tx) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "AdminUser" WHERE role = 'owner' FOR UPDATE`;
    const users = await tx.adminUser.findMany({ select: { id: true, role: true } });
    if (wouldLeaveNoOwner(users, change)) throw new AdminUserRuleError(LAST_OWNER_MESSAGE);
    return apply(tx);
  });
}

export function parseRole(value: FormDataEntryValue | null, fallback: Role): Role {
  return value === "owner" || value === "editor" ? value : fallback;
}
