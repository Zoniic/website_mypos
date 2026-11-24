import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getAdminContext } from "@/lib/adminAuth";
import { OwnerOnly } from "../../../OwnerOnly";
import { UserForm, type UserFormValues } from "../../UserForm";
import { deleteAdminUser, updateAdminUser } from "../../actions";

export default async function EditAdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user: session, role } = await getAdminContext();
  if (role !== "owner") return <OwnerOnly />;
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) notFound();
  const [user, owners] = await Promise.all([
    prisma.adminUser.findUnique({ where: { id: userId } }),
    prisma.adminUser.count({ where: { role: "owner" } }),
  ]);
  if (!user) notFound();

  const initialValues: UserFormValues = {
    email: user.email,
    name: user.name,
    role: user.role === "owner" ? "owner" : "editor",
  };
  const boundUpdate = updateAdminUser.bind(null, userId);
  const boundDelete = deleteAdminUser.bind(null, userId);

  const isSelf = session.userId === userId;
  const isLastOwner = user.role === "owner" && owners <= 1;
  const canDelete = !isSelf && !isLastOwner;

  return (
    <div>
      <h1 className="text-2xl font-bold">แก้ไขผู้ดูแลระบบ</h1>
      <div className="mt-6">
        <UserForm
          action={boundUpdate}
          initialValues={initialValues}
          submitLabel="บันทึก"
          isEdit
          actingName={session.name}
        />
      </div>
      <div className="mt-10 max-w-xl border-t border-border pt-6">
        {canDelete ? (
          <form action={boundDelete}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
            >
              <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
              ลบผู้ดูแลนี้
            </button>
          </form>
        ) : (
          <p className="text-sm text-text-2">
            {isSelf ? "ลบบัญชีที่กำลังใช้เข้าสู่ระบบอยู่ไม่ได้" : "ลบเจ้าของคนสุดท้ายไม่ได้"}
          </p>
        )}
      </div>
    </div>
  );
}
