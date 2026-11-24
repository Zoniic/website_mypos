"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { passwordVersion, readPendingTwoFactor } from "@/lib/adminAuth";
import { clearAttempts, isRateLimited, recordAttempt } from "@/lib/rateLimit";
import { loginClientKey } from "@/lib/loginLimit";
import { finishLogin } from "@/lib/loginSession";
import { TwoFactorError, consumeLoginCode } from "@/lib/twoFactor";
import { TWO_FACTOR_MESSAGES, twoFactorUserKey } from "@/lib/twoFactorPure";

/**
 * Step 2 of the login. It is open to visitors on purpose (no session exists
 * yet), but only with the 5-minute pending cookie that step 1 sets after a
 * correct password. Never log or echo the code.
 */
export async function verifyTwoFactorLogin(_prevState: string | null, formData: FormData): Promise<string | null> {
  const pending = await readPendingTwoFactor();
  if (!pending) redirect("/admin/login");
  const user = await prisma.adminUser.findUnique({ where: { id: pending.userId } });
  if (!user || !user.totpEnabledAt || pending.pwv !== passwordVersion(user.passwordHash)) redirect("/admin/login");

  // Wrong codes use the same 5-in-15-minutes budget as wrong passwords, plus a
  // per-account budget so many IP addresses cannot guess one account's code.
  const clientKey = await loginClientKey(user.email);
  const userKey = twoFactorUserKey(user.id);
  if (isRateLimited(clientKey) || isRateLimited(userKey)) return TWO_FACTOR_MESSAGES.tooMany;

  let used: "totp" | "backup" | null;
  try {
    used = await consumeLoginCode(user.id, String(formData.get("code") ?? ""));
  } catch (error) {
    if (error instanceof TwoFactorError) return error.message;
    throw error;
  }
  if (!used) {
    recordAttempt(clientKey);
    recordAttempt(userKey);
    return TWO_FACTOR_MESSAGES.wrongCode;
  }
  clearAttempts(clientKey);
  clearAttempts(userKey);
  return finishLogin(user, used === "backup" ? "ใช้รหัสสำรอง" : undefined);
}
