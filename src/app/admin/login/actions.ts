"use server";

import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";
import { clearAttempts, isRateLimited, recordAttempt } from "@/lib/rateLimit";

async function getClientKey(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}

export async function loginAction(_prevState: string | null, formData: FormData) {
  const clientKey = await getClientKey();

  if (isRateLimited(clientKey)) {
    return "Too many attempts. Please wait 15 minutes and try again.";
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = formData.get("password");

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

  redirect("/admin");
}
