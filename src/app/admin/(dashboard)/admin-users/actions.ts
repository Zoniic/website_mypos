"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/adminAuth";

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function createAdminUser(_prevState: string | null, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !name) return "Email and name are required.";
  if (password.length < 8) return "Password must be at least 8 characters.";

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.adminUser.create({ data: { email, name, passwordHash } });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `"${email}" is already registered.`;
    throw error;
  }

  revalidatePath("/admin/admin-users");
  redirect("/admin/admin-users");
}

export async function updateAdminUser(
  targetId: number,
  _prevState: string | null,
  formData: FormData
) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !name) return "Email and name are required.";
  if (password && password.length < 8) return "Password must be at least 8 characters.";

  const data: { email: string; name: string; passwordHash?: string } = { email, name };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.adminUser.update({ where: { id: targetId }, data });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `"${email}" is already registered.`;
    throw error;
  }

  revalidatePath("/admin/admin-users");
  redirect("/admin/admin-users");
}

export async function deleteAdminUser(targetId: number) {
  const session = await getSessionUser();
  if (session?.userId === targetId) {
    throw new Error("You can't delete your own account while signed in as it.");
  }

  const count = await prisma.adminUser.count();
  if (count <= 1) {
    throw new Error("Can't delete the last remaining admin user.");
  }

  await prisma.adminUser.delete({ where: { id: targetId } });
  revalidatePath("/admin/admin-users");
  redirect("/admin/admin-users");
}
