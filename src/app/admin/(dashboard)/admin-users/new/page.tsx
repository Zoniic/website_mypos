import { getAdminContext } from "@/lib/adminAuth";
import { OwnerOnly } from "../../OwnerOnly";
import { UserForm } from "../UserForm";
import { createAdminUser } from "../actions";

export default async function NewAdminUserPage() {
  const { role } = await getAdminContext();
  if (role !== "owner") return <OwnerOnly />;
  return (
    <div>
      <h1 className="text-2xl font-bold">เพิ่มผู้ดูแลระบบ</h1>
      <div className="mt-6">
        <UserForm action={createAdminUser} submitLabel="สร้าง" />
      </div>
    </div>
  );
}
