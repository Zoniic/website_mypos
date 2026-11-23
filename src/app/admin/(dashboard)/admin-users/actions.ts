"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, requireAdmin, setSessionCookie } from "@/lib/adminAuth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function createAdminUser(_prevState: string | null, formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !name) return "กรุณากรอกอีเมลและชื่อ";
  if (!EMAIL_PATTERN.test(email)) return "รูปแบบอีเมลไม่ถูกต้อง";
  if (password.length < 8) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await prisma.adminUser.create({ data: { email, name, passwordHash } });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `อีเมล "${email}" มีในระบบแล้ว`;
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
  const session = await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !name) return "กรุณากรอกอีเมลและชื่อ";
  if (!EMAIL_PATTERN.test(email)) return "รูปแบบอีเมลไม่ถูกต้อง";
  if (password && password.length < 8) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";

  const data: { email: string; name: string; passwordHash?: string } = { email, name };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  let updated: { id: number; email: string; name: string; passwordHash: string };
  try {
    updated = await prisma.adminUser.update({ where: { id: targetId }, data });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `อีเมล "${email}" มีในระบบแล้ว`;
    throw error;
  }

  // A new password ends every session signed with the old one (requireAdmin).
  // Keep the admin who changed their own password signed in on this browser.
  if (session.userId === targetId) {
    await setSessionCookie({ userId: updated.id, email: updated.email, name: updated.name }, updated.passwordHash);
  }

  revalidatePath("/admin/admin-users");
  redirect("/admin/admin-users");
}

export async function deleteAdminUser(targetId: number) {
  await requireAdmin();
  const session = await getSessionUser();
  if (session?.userId === targetId) {
    throw new Error("ลบบัญชีที่กำลังใช้เข้าสู่ระบบอยู่ไม่ได้");
  }

  const count = await prisma.adminUser.count();
  if (count <= 1) {
    throw new Error("ลบผู้ดูแลคนสุดท้ายไม่ได้");
  }

  await prisma.adminUser.delete({ where: { id: targetId } });
  revalidatePath("/admin/admin-users");
  redirect("/admin/admin-users");
}
