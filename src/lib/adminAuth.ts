import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { secureCookieWanted } from "@/lib/cookieSecurity";
import { prisma } from "@/lib/prisma";
import { can, isRole, type Permission, type Role } from "@/lib/permissions";
import {
  PENDING_2FA_COOKIE,
  PENDING_2FA_SECONDS,
  createPendingToken,
  verifyPendingToken,
  type PendingTwoFactor,
} from "@/lib/twoFactorPure";

export const ADMIN_SESSION_COOKIE = "mypos_admin_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = { userId: number; email: string; name: string };

/** The signed-in admin plus the role read from the database on this request. */
export type AdminContextUser = SessionUser & { role: Role };

/** Thrown when a signed-in admin lacks the permission for an action. */
export class ForbiddenError extends Error {
  constructor(message = "ไม่มีสิทธิ์ทำรายการนี้") {
    super(message);
    this.name = "ForbiddenError";
  }
}

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Short fingerprint of the stored password hash. It goes into the session
 * token, and requireAdmin() compares it with the current hash, so changing a
 * password ends every session that was signed in with the old one. The hash
 * itself never leaves the server.
 */
export function passwordVersion(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("base64url").slice(0, 16);
}

export async function createSessionToken(user: SessionUser, passwordHash: string): Promise<string> {
  // Pick the fields: the JWT claim `role: "admin"` means "is an admin", never owner/editor.
  return new SignJWT({
    role: "admin",
    userId: user.userId,
    email: user.email,
    name: user.name,
    pwv: passwordVersion(passwordHash),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

type SessionPayload = { role: string; userId: number; email: string; name: string; pwv?: string };

async function verifyPayload(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== "admin") return null;
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  return (await verifyPayload(token)) !== null;
}

/** Signs a session for this user and sets the session cookie (server actions only). */
export async function setSessionCookie(user: SessionUser, passwordHash: string): Promise<void> {
  const token = await createSessionToken(user, passwordHash);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: await secureCookieWanted(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Step 1 of a two-step login: the password was right but no session exists yet.
 * Sets a 5-minute signed cookie that only /admin/login/2fa accepts.
 */
export async function setPendingTwoFactorCookie(userId: number, passwordHash: string): Promise<void> {
  const token = await createPendingToken({ userId, pwv: passwordVersion(passwordHash) }, getSecret());
  const cookieStore = await cookies();
  cookieStore.set(PENDING_2FA_COOKIE, token, {
    httpOnly: true,
    secure: await secureCookieWanted(),
    sameSite: "lax",
    path: "/admin/login",
    maxAge: PENDING_2FA_SECONDS,
  });
}

/** The pending two-step login from the cookie, or null (missing, expired, forged). */
export async function readPendingTwoFactor(): Promise<PendingTwoFactor | null> {
  const cookieStore = await cookies();
  return verifyPendingToken(cookieStore.get(PENDING_2FA_COOKIE)?.value, getSecret());
}

export async function clearPendingTwoFactorCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PENDING_2FA_COOKIE, "", { path: "/admin/login", maxAge: 0 });
}

async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return verifyPayload(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

/** Reads the current admin's identity from the session cookie (server components/actions only). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const payload = await readSession();
  if (!payload) return null;
  return { userId: payload.userId, email: payload.email, name: payload.name };
}

/**
 * Authorization for admin Server Actions and route handlers. Actions are
 * reachable as public endpoints, so each one calls this itself — the proxy's
 * /admin cookie check is only the optimistic first line. Also rejects
 * sessions of admin users that were deleted since signing in, and sessions
 * signed before the user's password last changed (or before this check
 * existed: tokens without a password fingerprint).
 */
export async function requireAdmin(): Promise<AdminContextUser> {
  const payload = await readSession();
  const stored = payload
    ? await prisma.adminUser.findUnique({
        where: { id: payload.userId },
        select: { passwordHash: true, role: true },
      })
    : null;
  if (!payload || !stored || payload.pwv !== passwordVersion(stored.passwordHash)) redirect("/admin/login");
  // Unknown role values get the least privilege.
  const role: Role = isRole(stored.role) ? stored.role : "editor";
  return { userId: payload.userId, email: payload.email, name: payload.name, role };
}

/** Like requireAdmin(), and throws ForbiddenError unless the admin is an owner. */
export async function requireOwner(): Promise<AdminContextUser> {
  const user = await requireAdmin();
  if (user.role !== "owner") throw new ForbiddenError();
  return user;
}

/** Like requireAdmin(), and throws ForbiddenError unless the role has the permission. */
export async function requirePermission(permission: Permission): Promise<AdminContextUser> {
  const user = await requireAdmin();
  if (!can(user.role, permission)) throw new ForbiddenError();
  return user;
}

/** For pages: the admin, the role and a `can()` bound to it. Redirects like requireAdmin(). */
export async function getAdminContext(): Promise<{
  user: AdminContextUser;
  role: Role;
  can: (permission: Permission) => boolean;
}> {
  const user = await requireAdmin();
  return { user, role: user.role, can: (permission) => can(user.role, permission) };
}