import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ALL_PERMISSIONS,
  can,
  filterNavForRole,
  isRole,
  OWNER_ONLY_PERMISSIONS,
  ownerOnlyHrefs,
  type Permission,
} from "../../src/lib/permissions";

// The matrix in decisions.md, written out independently of the module.
const MATRIX: Record<Permission, { owner: boolean; editor: boolean }> = {
  "leads.manage": { owner: true, editor: true }, // answer leads, status, notes
  "orders.manage": { owner: true, editor: true },
  "products.manage": { owner: true, editor: true }, // add, edit, delete
  "copy.edit": { owner: true, editor: true },
  "photos.manage": { owner: true, editor: true },
  "articles.manage": { owner: true, editor: true },
  "layout.manage": { owner: true, editor: true },
  "leads.export": { owner: true, editor: true }, // R1b
  "account.own": { owner: true, editor: true },
  "adminUsers.manage": { owner: true, editor: false },
  "settings.manage": { owner: true, editor: false },
  "history.view": { owner: true, editor: false },
  "history.restore": { owner: true, editor: false },
};

test("every permission matches the decisions matrix for both roles", () => {
  assert.deepEqual([...ALL_PERMISSIONS].sort(), Object.keys(MATRIX).sort());
  for (const permission of ALL_PERMISSIONS) {
    assert.equal(can("owner", permission), MATRIX[permission].owner, `owner ${permission}`);
    assert.equal(can("editor", permission), MATRIX[permission].editor, `editor ${permission}`);
  }
});

test("owner-only set is exactly four permissions", () => {
  assert.deepEqual(
    [...OWNER_ONLY_PERMISSIONS].sort(),
    ["adminUsers.manage", "history.restore", "history.view", "settings.manage"],
  );
  const editorLacks = ALL_PERMISSIONS.filter((p) => !can("editor", p));
  assert.deepEqual([...editorLacks].sort(), [...OWNER_ONLY_PERMISSIONS].sort());
});

test("unknown, empty and missing roles have no permission", () => {
  for (const role of ["admin", "", "OWNER", undefined, null]) {
    for (const permission of ALL_PERMISSIONS) assert.equal(can(role, permission), false);
  }
  assert.equal(isRole("owner"), true);
  assert.equal(isRole("editor"), true);
  assert.equal(isRole("admin"), false);
});

test("ownerOnlyHrefs lists the three owner pages", () => {
  assert.deepEqual([...ownerOnlyHrefs], ["/admin/admin-users", "/admin/settings", "/admin/history"]);
});

const NAV = [
  { title: "A", items: [{ href: "/admin" }, { href: "/admin/orders" }] },
  { title: "B", items: [{ href: "/admin/settings" }, { href: "/admin/admin-users" }] },
  { title: "C", items: [{ href: "/admin/history" }, { href: "/admin/blog" }, { href: "/admin/history?x=1" }] },
];

test("filterNavForRole hides only owner-only items for editors and keeps everything for owners", () => {
  const editor = filterNavForRole("editor", NAV);
  const hrefs = editor.flatMap((g) => g.items.map((i) => i.href));
  assert.deepEqual(hrefs, ["/admin", "/admin/orders", "/admin/blog"]);
  assert.deepEqual(editor.map((g) => g.title), ["A", "C"]);
  assert.deepEqual(filterNavForRole("owner", NAV), NAV);
  assert.deepEqual(filterNavForRole(undefined, NAV).flatMap((g) => g.items.map((i) => i.href)), hrefs);
});
