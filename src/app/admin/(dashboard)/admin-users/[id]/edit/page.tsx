import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/adminAuth";
import { UserForm, type UserFormValues } from "../../UserForm";
import { deleteAdminUser, updateAdminUser } from "../../actions";

export default async function EditAdminUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  const [user, session, totalUsers] = await Promise.all([
    prisma.adminUser.findUnique({ where: { id: userId } }),
    getSessionUser(),
    prisma.adminUser.count(),
  ]);
  if (!user) notFound();

  const initialValues: UserFormValues = { email: user.email, name: user.name };
  const boundUpdate = updateAdminUser.bind(null, userId);
  const boundDelete = deleteAdminUser.bind(null, userId);

  const isSelf = session?.userId === userId;
  const isLastUser = totalUsers <= 1;
  const canDelete = !isSelf && !isLastUser;

  return (
    <div>
      <h1 className="text-2xl font-bold">แก้ไขผู้ดูแลระบบ</h1>
      <div className="mt-6">
        <UserForm action={boundUpdate} initialValues={initialValues} submitLabel="บันทึก" isEdit />
      </div>

      <div className="mt-10 border-t border-border pt-6">
        {canDelete ? (
          <form action={boundDelete}>
            <button
              type="submit"
              className="rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
            >
              Delete User
            </button>
          </form>
        ) : (
          <p className="text-sm text-text-2">
            {isSelf
              ? "You can't delete your own account while signed in as it."
              : "Can't delete the last remaining admin user."}
          </p>
        )}
      </div>
    </div>
  );
}
