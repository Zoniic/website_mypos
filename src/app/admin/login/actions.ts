"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
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

  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return "Password is required.";
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    recordAttempt(clientKey);
    return "Incorrect password.";
  }

  clearAttempts(clientKey);
  const token = await createSessionToken();
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
