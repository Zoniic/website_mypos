import { getAdminContext } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { getPendingEnrollment, twoFactorAvailable, unusedBackupCodeCount } from "@/lib/twoFactor";
import { AccountSecurity } from "./AccountSecurity";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { user } = await getAdminContext();
  const row = await prisma.adminUser.findUnique({ where: { id: user.userId }, select: { totpEnabledAt: true } });
  const enabled = Boolean(row?.totpEnabledAt);
  const [pending, remaining] = await Promise.all([
    enabled ? null : getPendingEnrollment(user),
    enabled ? unusedBackupCodeCount(user.userId) : 0,
  ]);
  return (
    <div>
      <h1 className="text-2xl font-bold">บัญชีของฉัน</h1>
      <p className="mt-1 text-text-2">
        {user.name} · {user.email}
      </p>
      <AccountSecurity enabled={enabled} pending={pending} available={twoFactorAvailable()} backupRemaining={remaining} />
    </div>
  );
}
