import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { test } from "node:test";
import { ADMIN_NAV } from "../../src/app/admin/(dashboard)/adminNav";
import { isOwnerOnlyHref, ownerOnlyHrefs } from "../../src/lib/permissions";

/**
 * Static guard: every admin Server Action and route handler must check the
 * session (and the role where the matrix says owner-only) on the server.
 * Pages and the sidebar only hide things; these checks are the protection.
 */

const ROOT = join(__dirname, "..", "..");
const ADMIN_DIR = join(ROOT, "src", "app", "admin");

const ANY_GUARD = /\b(requireAdmin|requireOwner|requirePermission|requireEditor)\(/;
const OWNER_GUARD = /\brequireOwner\(/;

/** Files whose actions are owner-only: every export must call requireOwner(). */
const OWNER_ONLY_FILES = ["(dashboard)/settings/actions.ts", "(dashboard)/admin-users/actions.ts", "(dashboard)/history/actions.ts"];
/** Own-account actions (step d) that act only on the session user. */
const SELF_SERVICE: string[] = [];
/** Public login flow: it creates the session, so it cannot require one. */
const LOGIN_EXEMPT = ["login/actions.ts"];
/** Route handlers that need no session by design (clearing cookies only). */
const ROUTE_EXEMPT = ["logout/route.ts", "live/exit/route.ts"];

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const rel = (file: string) => relative(ADMIN_DIR, file).split(sep).join("/");

/** Exported function names with their bodies (up to the next top-level export). */
function exportedFunctions(source: string): { name: string; body: string }[] {
  const re = /^export\s+(?:async\s+)?function\s+(\w+)/gm;
  const found: { name: string; index: number }[] = [];
  for (let m = re.exec(source); m; m = re.exec(source)) found.push({ name: m[1], index: m.index });
  return found.map((f, i) => ({ name: f.name, body: source.slice(f.index, found[i + 1]?.index ?? source.length) }));
}

const files = walk(ADMIN_DIR).filter((f) => /\.(ts|tsx)$/.test(f));
const actionFiles = [
  ...files.filter((f) => /^["']use server["']/.test(readFileSync(f, "utf8").trimStart())).map((f) => ({ file: f, label: rel(f) })),
  { file: join(ROOT, "src", "lib", "editActions.ts"), label: "src/lib/editActions.ts" },
];

test("there are admin action files to guard", () => {
  assert.ok(actionFiles.length >= 20, `found only ${actionFiles.length}`);
});

for (const { file, label } of actionFiles) {
  if (LOGIN_EXEMPT.includes(label)) continue;
  const fns = exportedFunctions(readFileSync(file, "utf8"));
  const ownerOnly = OWNER_ONLY_FILES.includes(label);
  for (const fn of fns) {
    if (SELF_SERVICE.includes(fn.name)) continue;
    test(`${label}: ${fn.name} checks the session${ownerOnly ? " and requires an owner" : ""}`, () => {
      assert.match(fn.body, ownerOnly ? OWNER_GUARD : ANY_GUARD);
    });
  }
}

test("edit-on-site actions go through requireEditor()", () => {
  const source = readFileSync(join(ROOT, "src", "lib", "editActions.ts"), "utf8");
  for (const fn of exportedFunctions(source)) assert.match(fn.body, /\brequireEditor\(/, fn.name);
});

test("every admin route handler checks the session", () => {
  const routes = files.filter((f) => /route\.ts$/.test(f));
  assert.ok(routes.length >= 7, `found only ${routes.length}`);
  for (const route of routes) {
    const label = rel(route);
    if (ROUTE_EXEMPT.includes(label)) continue;
    assert.match(readFileSync(route, "utf8"), ANY_GUARD, label);
  }
});

test("owner-only pages render the owner-only page for editors", () => {
  for (const page of ["(dashboard)/settings/page.tsx", "(dashboard)/admin-users/page.tsx", "(dashboard)/admin-users/new/page.tsx", "(dashboard)/admin-users/[id]/edit/page.tsx"]) {
    const source = readFileSync(join(ADMIN_DIR, page), "utf8");
    assert.match(source, /getAdminContext\(/, page);
    assert.match(source, /<OwnerOnly \/>/, page);
  }
});

test("nav items flagged ownerOnly match the owner-only hrefs", () => {
  const items = ADMIN_NAV.flatMap((g) => g.items);
  for (const item of items) assert.equal(Boolean(item.ownerOnly), isOwnerOnlyHref(item.href), item.href);
  const present = items.filter((i) => i.ownerOnly).map((i) => i.href);
  // The history entry is added in a later step.
  for (const href of ownerOnlyHrefs.filter((h) => h !== "/admin/history")) assert.ok(present.includes(href), href);
});
