"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/adminAuth";

export async function loginAction(_prevState: string | null, formData: FormData) {
  const password = formData.get("password");

  if (typeof password !== "string" || password.length === 0) {
    return "Password is required.";
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return "Incorrect password.";
  }

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
