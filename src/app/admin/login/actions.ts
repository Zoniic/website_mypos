"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setPendingTwoFactorCookie } from "@/lib/adminAuth";
import { clearAttempts, isRateLimited, recordAttempt } from "@/lib/rateLimit";
import { loginClientKey } from "@/lib/loginLimit";
import { finishLogin } from "@/lib/loginSession";

export async function loginAction(_prevState: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = formData.get("password");
  const clientKey = await loginClientKey(email);

  if (isRateLimited(clientKey)) {
    return "ลองผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่";
  }
  if (!email || typeof password !== "string" || password.length === 0) {
    return "กรุณากรอกอีเมลและรหัสผ่าน";
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) {
    recordAttempt(clientKey);
    return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
  }

  if (user.totpEnabledAt) {
    // Two-step login is on: no session yet. The failed-attempt budget is kept
    // (not cleared) so wrong passwords and wrong codes share the same 5 tries.
    await setPendingTwoFactorCookie(user.id, user.passwordHash);
    redirect("/admin/login/2fa");
  }

  clearAttempts(clientKey);
  return finishLogin(user);
}
