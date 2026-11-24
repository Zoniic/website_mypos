/**
 * Owner and editor permission matrix (decisions R1b + R1c, `.agents/tasks/admin-v2/decisions.md`).
 * Pure module: no database, no Next imports, so it can be unit tested and
 * used by pages, actions and the sidebar alike.
 */

export type Role = "owner" | "editor";

export const ROLES: readonly Role[] = ["owner", "editor"];

export function isRole(value: unknown): value is Role {
  return value === "owner" || value === "editor";
}

/** Owner-only permissions. Editors never get these. */
export const OWNER_ONLY_PERMISSIONS = [
  "adminUsers.manage",
  "settings.manage",
  "history.view",
  "history.restore",
] as const;

/** Permissions both roles have. */
export const SHARED_PERMISSIONS = [
  "leads.manage",
  "leads.export",
  "orders.manage",
  "products.manage",
  "copy.edit",
  "photos.manage",
  "articles.manage",
  "layout.manage",
  "account.own",
] as const;

export type Permission = (typeof OWNER_ONLY_PERMISSIONS)[number] | (typeof SHARED_PERMISSIONS)[number];

export const ALL_PERMISSIONS: readonly Permission[] = [...OWNER_ONLY_PERMISSIONS, ...SHARED_PERMISSIONS];

const OWNER_ONLY = new Set<string>(OWNER_ONLY_PERMISSIONS);
const SHARED = new Set<string>(SHARED_PERMISSIONS);

/** True when the role has the permission. Unknown or missing roles have none. */
export function can(role: Role | string | null | undefined, permission: Permission): boolean {
  if (role === "owner") return OWNER_ONLY.has(permission) || SHARED.has(permission);
  if (role === "editor") return SHARED.has(permission);
  return false;
}

/** Sidebar and dashboard links that only owners see. */
export const ownerOnlyHrefs: readonly string[] = ["/admin/admin-users", "/admin/settings", "/admin/history"];

function hrefPath(href: string): string {
  return href.split("?")[0];
}

export function isOwnerOnlyHref(href: string): boolean {
  const path = hrefPath(href);
  return ownerOnlyHrefs.some((h) => path === h || path.startsWith(`${h}/`));
}

/** Drops owner-only items (and groups left empty) for roles that may not see them. */
export function filterNavForRole<G extends { items: { href: string }[] }>(
  role: Role | string | null | undefined,
  groups: readonly G[],
): G[] {
  if (role === "owner") return [...groups];
  return groups
    .map((group) => ({ ...group, items: group.items.filter((item) => !isOwnerOnlyHref(item.href)) }))
    .filter((group) => group.items.length > 0);
}
