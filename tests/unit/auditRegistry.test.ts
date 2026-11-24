import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import {
  ENTITIES,
  ENTITY_TYPES,
  NOTE_MASK,
  contentChangesByKey,
  entityAction,
  entityChanges,
  isRestorableChange,
  isRestorableField,
  splitContentId,
} from "../../src/lib/auditRegistry";

const ROOT = join(__dirname, "..", "..");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

test("every record type that the code writes to the history is in the registry", () => {
  const re = /\b(?:auditEntity|auditKeyed|auditNote|loadSnapshot)\(\s*(?:\w+,\s*)?"(\w+)"|entityType:\s*"(\w+)"/g;
  const used = new Set<string>();
  for (const file of walk(join(ROOT, "src"))) {
    if (/auditRegistry\.ts$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    for (let m = re.exec(text); m; m = re.exec(text)) used.add(m[1] ?? m[2]);
  }
  assert.ok(used.size >= 15, `found only ${used.size} types`);
  for (const type of used) assert.ok(ENTITIES[type], `${type} is missing from auditRegistry`);
});

test("registry models and translation columns exist in the Prisma schema", () => {
  const schema = readFileSync(join(ROOT, "prisma", "schema.prisma"), "utf8");
  const modelBody = (name: string) => {
    const pascal = name[0].toUpperCase() + name.slice(1);
    const m = new RegExp(`model ${pascal} \\{([\\s\\S]*?)\\n\\}`).exec(schema);
    assert.ok(m, `model ${pascal} not found`);
    return m[1];
  };
  for (const config of Object.values(ENTITIES)) {
    if (config.model) modelBody(config.model);
    if (config.translations) {
      const body = modelBody(config.translations.model);
      assert.match(body, new RegExp(`\\b${config.translations.fk}\\b`));
      for (const field of config.translations.fields) assert.match(body, new RegExp(`\\b${field}\\b`), field);
    }
  }
});

test("no price, photo, link, slug or status field is restorable", () => {
  const forbidden = /price|image|url|logo|slug|status|sortOrder|featured|isOpen/i;
  for (const config of Object.values(ENTITIES)) {
    for (const field of config.translations?.restorable ?? []) assert.doesNotMatch(field, forbidden, `${config.type}.${field}`);
  }
  for (const field of ["priceFrom", "onlinePrice", "imageUrl", "galleryUrls", "slug", "status", "coverImageUrl", "url"]) {
    assert.equal(isRestorableField("Product", field, "th"), false, field);
    assert.equal(isRestorableField("SiteImage", field, undefined), false, field);
  }
  assert.equal(isRestorableField("SiteSetting", "value", undefined), false);
});

test("only text in a language is restorable: Page Content value and translated text", () => {
  assert.equal(isRestorableField("PageContent", "value", "en"), true);
  assert.equal(isRestorableField("PageContent", "value", undefined), false);
  assert.equal(isRestorableField("PageContent", "value", "fr"), false);
  assert.equal(isRestorableField("Product", "name", "th"), true);
  assert.equal(isRestorableField("Product", "name", undefined), false);
  assert.equal(isRestorableField("KbArticle", "body", "zh"), true);
  assert.equal(isRestorableField("TrustLogo", "name", "th"), false);
});

test("create, delete and non-text rows are never restorable", () => {
  const change = { field: "value", locale: "th", before: "เก่า", after: "ใหม่" };
  assert.equal(isRestorableChange({ action: "update", entityType: "PageContent" }, change), true);
  assert.equal(isRestorableChange({ action: "restore", entityType: "PageContent" }, change), true);
  assert.equal(isRestorableChange({ action: "delete", entityType: "PageContent" }, change), false);
  assert.equal(isRestorableChange({ action: "create", entityType: "PageContent" }, change), false);
  assert.equal(isRestorableChange({ action: "update", entityType: "PageContent" }, { ...change, before: null }), false);
  assert.equal(isRestorableChange({ action: "delete", entityType: "Product" }, { field: "name", locale: "th", before: "x", after: null }), false);
  assert.equal(isRestorableChange({ action: "update", entityType: "Product" }, { field: "priceFrom", before: "100", after: "120" }), false);
});

test("entityChanges: update lists only changed fields and folds translations in by language", () => {
  const config = ENTITIES.Product;
  const before = {
    id: 1, slug: "k156", priceFrom: 100, updatedAt: new Date(0),
    categories: [{ slug: "pos" }],
    translations: [{ locale: "th", name: "เก่า", highlight: "h" }, { locale: "en", name: "old", highlight: "h" }],
  };
  const after = {
    ...before, priceFrom: 120, categories: [{ slug: "self-order" }, { slug: "pos" }],
    translations: [{ locale: "th", name: "ใหม่", highlight: "h" }, { locale: "en", name: "old", highlight: "h" }],
  };
  const changes = entityChanges(config, before, after);
  assert.deepEqual(changes, [
    { field: "categories", before: "pos", after: "pos,self-order" },
    { field: "priceFrom", before: 100, after: 120 },
    { field: "name", locale: "th", before: "เก่า", after: "ใหม่" },
  ]);
  assert.equal(entityAction(config, before, after, changes), "update");
});

test("entityChanges: create lists fields with before null, delete with after null (deleted records stay viewable)", () => {
  const config = ENTITIES.Product;
  const row = { id: 2, slug: "x", priceFrom: 5, translations: [{ locale: "th", name: "ชื่อ", highlight: "" }] };
  const created = entityChanges(config, null, row);
  assert.ok(created.length >= 3 && created.every((c) => c.before === null));
  assert.ok(created.some((c) => c.field === "name" && c.locale === "th" && c.after === "ชื่อ"));
  const deleted = entityChanges(config, row, null);
  assert.ok(deleted.every((c) => c.after === null));
  assert.ok(deleted.some((c) => c.field === "name" && c.before === "ชื่อ"));
  assert.equal(entityAction(config, null, row, created), "create");
  assert.equal(entityAction(config, row, null, deleted), "delete");
});

test("entityChanges: nothing changed gives no changes", () => {
  const row = { id: 3, slug: "y", priceFrom: 1, translations: [{ locale: "th", name: "a", highlight: "b" }] };
  assert.deepEqual(entityChanges(ENTITIES.Product, row, structuredClone(row)), []);
});

test("lead notes are never copied: only 'edited' is recorded", () => {
  const config = ENTITIES.ContactMessage;
  const before = { id: 9, name: "คุณสุดา", status: "new", assigneeId: null, adminNote: "โทรเบอร์ 081-234-5678" };
  const after = { ...before, adminNote: "นัดวันพุธ" };
  const changes = entityChanges(config, before, after);
  assert.deepEqual(changes, [{ field: "adminNote", before: NOTE_MASK, after: NOTE_MASK }]);
  assert.doesNotMatch(JSON.stringify(changes), /081|พุธ/);
  const added = entityChanges(config, { ...before, adminNote: null }, after);
  assert.deepEqual(added, [{ field: "adminNote", before: null, after: NOTE_MASK }]);
});

test("a change to the status alone is a status change; with other fields it is an update", () => {
  const config = ENTITIES.ContactMessage;
  const before = { id: 9, name: "ก", status: "new", assigneeId: null, adminNote: null };
  const only = entityChanges(config, before, { ...before, status: "contacted" });
  assert.equal(entityAction(config, before, { ...before, status: "contacted" }, only), "status_change");
  const both = entityChanges(config, before, { ...before, status: "closed", assigneeId: 4 });
  assert.equal(entityAction(config, before, { ...before, status: "closed", assigneeId: 4 }, both), "update");
  const order = ENTITIES.Order;
  const o1 = { id: 1, number: "MP1", status: "pending_payment", adminNote: null, paidAt: null };
  const o2 = { ...o1, status: "paid", paidAt: new Date("2026-01-01T00:00:00Z") };
  assert.equal(entityAction(order, o1, o2, entityChanges(order, o1, o2)), "status_change");
});

test("contentChangesByKey: one entry per changed key, unchanged keys are skipped", () => {
  const existing = [
    { key: "hero.title", locale: "th", value: "เก่า" },
    { key: "hero.title", locale: "en", value: "old" },
    { key: "hero.sub", locale: "th", value: "same" },
  ];
  const updates = [
    { key: "hero.title", locale: "th", value: "ใหม่" },
    { key: "hero.title", locale: "en", value: "old" },
    { key: "hero.sub", locale: "th", value: "same" },
    { key: "hero.new", locale: "th", value: "x" },
  ];
  const result = contentChangesByKey(existing, updates);
  assert.equal(result.length, 2);
  assert.deepEqual(result[0], { key: "hero.new", action: "create", changes: [{ field: "value", locale: "th", before: null, after: "x" }] });
  assert.deepEqual(result[1], { key: "hero.title", action: "update", changes: [{ field: "value", locale: "th", before: "เก่า", after: "ใหม่" }] });
  assert.deepEqual(contentChangesByKey(existing, existing), []);
});

test("splitContentId splits at the first dot", () => {
  assert.deepEqual(splitContentId("home.hero.title"), { namespace: "home", key: "hero.title" });
  assert.equal(splitContentId("home"), null);
  assert.equal(splitContentId(".x"), null);
});

test("the data-type filter lists every registry type with a Thai label", () => {
  for (const type of ENTITY_TYPES) assert.match(ENTITIES[type].label, /[\u0E00-\u0E7F]/, type);
});
