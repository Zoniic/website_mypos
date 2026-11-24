"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, setSessionCookie } from "@/lib/adminAuth";
import { checkActingPassword } from "@/lib/adminUsers";
import { auditPasswordChange } from "@/lib/auditLog";
import { TwoFactorError, beginEnrollment, confirmEnrollment, disableTwoFactor } from "@/lib/twoFactor";

// Own-account actions. Every one starts with requireAdmin() and acts only on
// that session user: no user id is read from the form. Never log the
// passwords or the codes handled here.

export type SetupState = { error: string | null; codes: string[] | null };
export type FormState = { error: string | null; done: boolean };

const errorText = (error: unknown): string | null => (error instanceof TwoFactorError ? error.message : null);

/** Starts setup: creates the secret, so the QR code can be shown. */
export async function startTwoFactorSetup(): Promise<void> {
  const admin = await requireAdmin();
  await beginEnrollment(admin);
  revalidatePath("/admin/account");
}

/** Confirms the first code from the app. On success returns the backup codes, shown once. */
export async function confirmTwoFactorSetup(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const admin = await requireAdmin();
  try {
    const codes = await confirmEnrollment(admin, String(formData.get("code") ?? ""));
    revalidatePath("/admin/account");
    return { error: null, codes };
  } catch (error) {
    const message = errorText(error);
    if (message) return { error: message, codes: null };
    throw error;
  }
}

/** Turns two-step login off. Needs the account password and a current code. */
export async function disableTwoFactorAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  try {
    await disableTwoFactor(admin, String(formData.get("password") ?? ""), String(formData.get("code") ?? ""));
  } catch (error) {
    const message = errorText(error);
    if (message) return { error: message, done: false };
    throw error;
  }
  revalidatePath("/admin/account");
  revalidatePath("/admin/admin-users");
  return { error: null, done: true };
}

/** Changes the signed-in admin's own password. Other devices are signed out; this one stays signed in. */
export async function changeOwnPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const again = String(formData.get("confirmPassword") ?? "");
  const wrongCurrent = await checkActingPassword(admin.userId, current);
  if (wrongCurrent) return { error: wrongCurrent, done: false };
  if (next.length < 8) return { error: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร", done: false };
  if (next !== again) return { error: "รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน", done: false };
  const passwordHash = await bcrypt.hash(next, 10);
  await prisma.$transaction(async (tx) => {
    await tx.adminUser.update({ where: { id: admin.userId }, data: { passwordHash } });
    await auditPasswordChange(admin, admin.userId, admin.email, { client: tx as unknown as typeof prisma, transactional: true });
  });
  // The session fingerprint follows the password, so sign this device in again with the new one.
  await setSessionCookie({ userId: admin.userId, email: admin.email, name: admin.name }, passwordHash);
  revalidatePath("/admin/account");
  return { error: null, done: true };
}
