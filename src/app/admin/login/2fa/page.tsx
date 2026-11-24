import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { passwordVersion, readPendingTwoFactor } from "@/lib/adminAuth";
import { TwoFactorForm } from "./TwoFactorForm";

export const dynamic = "force-dynamic";

export default async function AdminTwoFactorPage() {
  const pending = await readPendingTwoFactor();
  const user = pending
    ? await prisma.adminUser.findUnique({ where: { id: pending.userId }, select: { email: true, passwordHash: true, totpEnabledAt: true } })
    : null;
  if (!pending || !user || !user.totpEnabledAt || pending.pwv !== passwordVersion(user.passwordHash)) redirect("/admin/login");
  return <TwoFactorForm email={user.email} />;
}
