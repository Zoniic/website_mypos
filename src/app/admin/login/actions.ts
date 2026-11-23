"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";
import { clearAttempts, isRateLimited, recordAttempt } from "@/lib/rateLimit";
import { ADMIN_HINT_COOKIE } from "@/lib/editMode";
import { clientIp } from "@/lib/clientIp";

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
    return "Too many attempts. Please wait 15 minutes and try again.";
  }

  if (!email || typeof password !== "string" || password.length === 0) {
    return "Email and password are required.";
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !valid) {
    recordAttempt(clientKey);
    return "Incorrect email or password.";
  }

  clearAttempts(clientKey);
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = await createSessionToken({ userId: user.id, email: user.email, name: user.name });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  // Readable hint (not a credential) so public pages can show "Edit this page".
  cookieStore.set(ADMIN_HINT_COOKIE, "1", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  redirect("/admin");
}
