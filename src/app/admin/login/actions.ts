"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_MAX_AGE_SECONDS, setSessionCookie } from "@/lib/adminAuth";
import { clearAttempts, isRateLimited, recordAttempt } from "@/lib/rateLimit";
import { ADMIN_HINT_COOKIE } from "@/lib/editMode";
import { clientIp } from "@/lib/clientIp";
import { auditLogin } from "@/lib/auditLog";

/**
 * Limit key for failed logins. Without a reverse proxy there is no client IP
 * ("unknown"), and one shared bucket would let five wrong passwords lock every
 * admin out, so in that case the limit is kept per account instead.
 */
async function getClientKey(email: string): Promise<string> {
  const ip = await clientIp();
  return ip === "unknown" ? `login:unknown:${email.slice(0, 160)}` : `login:${ip}`;
}

export async function loginAction(_prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = formData.get("password");
  const clientKey = await getClientKey(email);

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

  clearAttempts(clientKey);
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  await setSessionCookie({ userId: user.id, email: user.email, name: user.name }, user.passwordHash);
  // Readable hint (not a credential) so public pages can show "Edit this page".
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_HINT_COOKIE, "1", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  await auditLogin({ userId: user.id, email: user.email, name: user.name });
  redirect("/admin");
}
