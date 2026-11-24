import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SESSION_MAX_AGE_SECONDS, clearPendingTwoFactorCookie, setSessionCookie } from "@/lib/adminAuth";
import { ADMIN_HINT_COOKIE } from "@/lib/editMode";
import { auditLogin } from "@/lib/auditLog";
import { secureCookieWanted } from "@/lib/cookieSecurity";

type LoginUser = { id: number; email: string; name: string; passwordHash: string };

/**
 * The last step of every login (password only, or password plus code): sets
 * the session and hint cookies, records the sign-in once, and goes to /admin.
 * `detail` says how the admin got in when it is not the usual way.
 */
export async function finishLogin(user: LoginUser, detail?: string): Promise<never> {
  await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await setSessionCookie({ userId: user.id, email: user.email, name: user.name }, user.passwordHash);
  await clearPendingTwoFactorCookie();
  // Readable hint (not a credential) so public pages can show "Edit this page".
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_HINT_COOKIE, "1", {
    secure: await secureCookieWanted(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  await auditLogin({ userId: user.id, email: user.email, name: user.name }, detail);
  redirect("/admin");
}
