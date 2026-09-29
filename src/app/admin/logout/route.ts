import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { draftMode } from "next/headers";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminAuth";
import { ADMIN_HINT_COOKIE } from "@/lib/editMode";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  cookieStore.delete(ADMIN_HINT_COOKIE);
  (await draftMode()).disable();
  redirect("/admin/login");
}
