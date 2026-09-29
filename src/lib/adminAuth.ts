import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const ADMIN_SESSION_COOKIE = "mypos_admin_session";

export type SessionUser = { userId: number; email: string; name: string };

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ role: "admin", ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

async function verifyPayload(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin") return null;
    return payload as { role: string; userId: number; email: string; name: string };
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  return (await verifyPayload(token)) !== null;
}

/** Reads the current admin's identity from the session cookie (server components/actions only). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const payload = await verifyPayload(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
  if (!payload) return null;
  return { userId: payload.userId, email: payload.email, name: payload.name };
}

/**
 * Authorization for admin Server Actions and route handlers. Actions are
 * reachable as public endpoints, so each one calls this itself — the proxy's
 * /admin cookie check is only the optimistic first line. Also rejects
 * sessions of admin users that were deleted since signing in.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  const exists = user && (await prisma.adminUser.findUnique({ where: { id: user.userId }, select: { id: true } }));
  if (!user || !exists) redirect("/admin/login");
  return user;
}
