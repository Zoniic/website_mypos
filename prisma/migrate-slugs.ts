/**
 * Rewrites every product, accessory, KB category and KB article slug to a
 * URL-safe lowercase slug ("mypos-K1" -> "mypos-k1", "Change paper K1" ->
 * "change-paper-k1"), and updates the places that refer to those slugs:
 * KbArticle.productSlug / accessorySlug and any whole-word mention of an old
 * slug in SiteSetting and PageContent values.
 *
 * Old URLs keep working without a stored alias: src/proxy.ts redirects any
 * slug that differs from a stored one only by case / spaces / punctuation /
 * encoding (see slugKey in src/lib/slug.ts) to the new URL.
 *
 * Left alone on purpose: QuoteRequestItem.productSlug, WarrantyClaim.productSlug
 * and OrderItem.slug are snapshots of what the customer ordered. Old slugs in
 * them still resolve through the same normalising lookups.
 *
 * Safe by default:
 *   - dry run: lists every change and writes nothing;
 *   - with --write, the original rows are first saved to
 *     prisma/backups/migrate-slugs-<timestamp>.json, then updated in one transaction;
 *   - idempotent: a second run finds nothing to change;
 *   - stops without writing if two rows would end up with the same slug.
 *
 * Run:
 *   npx tsx prisma/migrate-slugs.ts          (dry run)
 *   npx tsx prisma/migrate-slugs.ts --write  (backup, then update)
 *
 * The public site caches page copy; after --write restart the server or save
 * any page once in the admin to see the change right away.
 */
import { PrismaClient } from "@prisma/client";
import { auditScriptRun } from "./script-audit";
import fs from "node:fs";
import path from "node:path";
import { isSafeSlug, slugify } from "../src/lib/slug";

type SlugRow = { id: number; slug: string };
type Rename = { table: string; id: number; from: string; to: string };

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function main() {
  const write = process.argv.includes("--write");
  const prisma = new PrismaClient();
  try {
    const tables: [string, SlugRow[]][] = [
      ["Product", await prisma.product.findMany({ select: { id: true, slug: true } })],
      ["Accessory", await prisma.accessory.findMany({ select: { id: true, slug: true } })],
      ["KbCategory", await prisma.kbCategory.findMany({ select: { id: true, slug: true } })],
      ["KbArticle", await prisma.kbArticle.findMany({ select: { id: true, slug: true } })],
    ];

    const renames: Rename[] = [];
    const problems: string[] = [];
    for (const [table, rows] of tables) {
      const taken = new Set(rows.map((r) => r.slug));
      const claimed = new Map<string, string>();
      for (const row of rows) {
        if (isSafeSlug(row.slug)) continue;
        const to = slugify(row.slug);
        if (!isSafeSlug(to)) {
          problems.push(`${table} #${row.id}: "${row.slug}" has no usable characters`);
        } else if (taken.has(to) && to !== row.slug) {
          problems.push(`${table} #${row.id}: "${row.slug}" -> "${to}" is already used by another row`);
        } else if (claimed.has(to)) {
          problems.push(`${table} #${row.id}: "${row.slug}" -> "${to}" collides with "${claimed.get(to)}"`);
        } else {
          claimed.set(to, row.slug);
          renames.push({ table, id: row.id, from: row.slug, to });
        }
      }
    }
    if (problems.length) {
      console.error("Cannot migrate, fix these first:\n  " + problems.join("\n  "));
      process.exitCode = 1;
      return;
    }

    const productMap = new Map(renames.filter((r) => r.table === "Product").map((r) => [r.from, r.to]));
    const accessoryMap = new Map(renames.filter((r) => r.table === "Accessory").map((r) => [r.from, r.to]));

    // KB articles that point at a product / accessory by slug.
    const articles = await prisma.kbArticle.findMany({ select: { id: true, productSlug: true, accessorySlug: true } });
    const articleRefs = articles.flatMap((a) => {
      const data: { productSlug?: string; accessorySlug?: string } = {};
      if (a.productSlug && productMap.has(a.productSlug)) data.productSlug = productMap.get(a.productSlug)!;
      if (a.accessorySlug && accessoryMap.has(a.accessorySlug)) data.accessorySlug = accessoryMap.get(a.accessorySlug)!;
      return Object.keys(data).length ? [{ id: a.id, before: a, data }] : [];
    });

    // Whole-word mentions of an old slug in stored copy / settings (nav links, JSON lists, ...).
    const textFixes: { table: "SiteSetting" | "PageContent"; id: number; key: string; before: string; after: string }[] = [];
    const oldSlugs = renames.filter((r) => r.table === "Product" || r.table === "Accessory" || r.table === "KbArticle");
    const textRows = [
      ...(await prisma.siteSetting.findMany()).map((r) => ({ table: "SiteSetting" as const, id: r.id, key: r.key, value: r.value })),
      ...(await prisma.pageContent.findMany()).map((r) => ({ table: "PageContent" as const, id: r.id, key: `${r.namespace}.${r.key}[${r.locale}]`, value: r.value })),
    ];
    for (const row of textRows) {
      let after = row.value;
      for (const r of oldSlugs) {
        after = after.replace(new RegExp(`(?<![A-Za-z0-9-])${escapeRegExp(r.from)}(?![A-Za-z0-9-])`, "g"), r.to);
      }
      if (after !== row.value) textFixes.push({ table: row.table, id: row.id, key: row.key, before: row.value, after });
    }

    for (const r of renames) console.log(`${r.table} #${r.id}: ${JSON.stringify(r.from)} -> ${JSON.stringify(r.to)}`);
    for (const a of articleRefs) console.log(`KbArticle #${a.id} refs: ${JSON.stringify(a.before)} -> ${JSON.stringify(a.data)}`);
    for (const t of textFixes) console.log(`${t.table} #${t.id} (${t.key}): old slug mentioned, will be replaced`);

    const total = renames.length + articleRefs.length + textFixes.length;
    if (total === 0) {
      console.log("Nothing to change: every slug is already URL-safe.");
      return;
    }
    if (!write) {
      console.log(`\nDry run: ${total} change(s), nothing written. Re-run with --write to apply.`);
      return;
    }

    const dir = path.join(__dirname, "backups");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `migrate-slugs-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(
      file,
      JSON.stringify({ renames, kbArticleRefs: articleRefs.map((a) => a.before), textRows: textFixes.map((t) => ({ table: t.table, id: t.id, key: t.key, value: t.before })) }, null, 2)
    );
    console.log(`\nBackup written: ${file}`);

    await prisma.$transaction([
      ...renames.map((r) => {
        const args = { where: { id: r.id }, data: { slug: r.to } };
        switch (r.table) {
          case "Product": return prisma.product.update(args);
          case "Accessory": return prisma.accessory.update(args);
          case "KbCategory": return prisma.kbCategory.update(args);
          default: return prisma.kbArticle.update(args);
        }
      }),
      ...articleRefs.map((a) => prisma.kbArticle.update({ where: { id: a.id }, data: a.data })),
      ...textFixes.map((t) =>
        t.table === "SiteSetting"
          ? prisma.siteSetting.update({ where: { id: t.id }, data: { value: t.after } })
          : prisma.pageContent.update({ where: { id: t.id }, data: { value: t.after } })
      ),
    ]);
    console.log(`Applied ${total} change(s).`);
    await auditScriptRun(prisma, "migrate-slugs", total, file);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
