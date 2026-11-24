"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auditEntity, auditPasswordChange, loadSnapshot } from "@/lib/auditLog";
import { requireOwner, setSessionCookie } from "@/lib/adminAuth";
import { AdminUserRuleError, checkActingPassword, parseRole, withOwnerGuard } from "@/lib/adminUsers";

// Every action here is owner-only: requireOwner() reads the role from the
// database on each call, so a demoted owner is refused on the very next request.

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
  const admin = await requireOwner();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"), "editor");

  if (!email || !name) return "กรุณากรอกอีเมลและชื่อ";
  if (!EMAIL_PATTERN.test(email)) return "รูปแบบอีเมลไม่ถูกต้อง";
  if (password.length < 8) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";

  const passwordHash = await bcrypt.hash(password, 10);
  let created;
  try {
    created = await prisma.adminUser.create({
      data: { email, name, passwordHash, role },
      select: { id: true, email: true, name: true, role: true },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `อีเมล "${email}" มีในระบบแล้ว`;
    throw error;
  }

  await auditEntity(admin, "AdminUser", null, created);
  revalidatePath("/admin/admin-users");
  redirect("/admin/admin-users");
}

export async function updateAdminUser(
  targetId: number,
  _prevState: string | null,
  formData: FormData
) {
  const session = await requireOwner();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const currentPassword = String(formData.get("currentPassword") ?? "");

  if (!email || !name) return "กรุณากรอกอีเมลและชื่อ";
  if (!EMAIL_PATTERN.test(email)) return "รูปแบบอีเมลไม่ถูกต้อง";
  if (password && password.length < 8) return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";

  const target = await prisma.adminUser.findUnique({
    where: { id: targetId },
    select: { email: true, role: true },
  });
  if (!target) return "ไม่พบผู้ดูแลนี้";
  const role = parseRole(formData.get("role"), target.role === "owner" ? "owner" : "editor");

  // Email, password or role: confirm it is really the signed-in admin asking.
  const sensitive = email !== target.email || password !== "" || role !== target.role;
  if (sensitive) {
    const problem = await checkActingPassword(session.userId, currentPassword);
    if (problem) return problem;
  }

  const data: { email: string; name: string; role: string; passwordHash?: string } = { email, name, role };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);

  let updated: { id: number; email: string; name: string; passwordHash: string };
  try {
    updated = await withOwnerGuard({ kind: "setRole", id: targetId, role }, async (tx) => {
      const db = tx as unknown as typeof prisma;
      const before = await loadSnapshot("AdminUser", targetId, db);
      const result = await tx.adminUser.update({ where: { id: targetId }, data });
      const after = await loadSnapshot("AdminUser", targetId, db);
      const options = { client: db, transactional: true };
      await auditEntity(session, "AdminUser", before, after, { ...options, action: role !== target.role ? "role_change" : undefined });
      if (password) await auditPasswordChange(session, targetId, result.email, options);
      return result;
    });
  } catch (error) {
    if (error instanceof AdminUserRuleError) return error.message;
    if (isUniqueConstraintError(error)) return `อีเมล "${email}" มีในระบบแล้ว`;
    throw error;
  }

  // A new password ends every session signed with the old one (requireAdmin).
  // Keep the admin who changed their own password signed in on this browser.
  if (session.userId === targetId) {
    await setSessionCookie({ userId: updated.id, email: updated.email, name: updated.name }, updated.passwordHash);
  }

  revalidatePath("/admin/admin-users");
  // An owner who made themselves an editor lands on the normal editor view.
  redirect(session.userId === targetId && role !== "owner" ? "/admin" : "/admin/admin-users");
}

export async function deleteAdminUser(targetId: number) {
  const session = await requireOwner();
  if (session.userId === targetId) {
    throw new Error("ลบบัญชีที่กำลังใช้เข้าสู่ระบบอยู่ไม่ได้");
  }

  await withOwnerGuard({ kind: "delete", id: targetId }, async (tx) => {
    const count = await tx.adminUser.count();
    if (count <= 1) throw new AdminUserRuleError("ลบผู้ดูแลคนสุดท้ายไม่ได้");
    const db = tx as unknown as typeof prisma;
    const before = await loadSnapshot("AdminUser", targetId, db);
    await tx.adminUser.delete({ where: { id: targetId } });
    await auditEntity(session, "AdminUser", before, null, { client: db, transactional: true });
  });

  revalidatePath("/admin/admin-users");
  redirect("/admin/admin-users");
}
