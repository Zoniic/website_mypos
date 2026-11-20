/**
 * Removes emoji from the copy stored in the database (the site uses Lucide
 * icons only, see DESIGN.md section 10).
 *
 * Safe by default:
 *   - dry run: lists every field that would change and writes nothing;
 *   - with --write, the original values are first saved to
 *     prisma/backups/strip-emoji-<timestamp>.json, then the rows are updated;
 *   - idempotent: a second run finds nothing to change.
 *
 * Run:
 *   npx tsx prisma/strip-emoji.ts              (dry run)
 *   npx tsx prisma/strip-emoji.ts --write      (backup, then update)
 *   npx tsx prisma/strip-emoji.ts --self-test  (check the emoji helper, no database)
 *
 * The public site caches page copy, so after --write restart the server or
 * save any page once in the admin to see the change right away.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { hasEmoji, stripEmoji } from "../src/lib/emoji";

type Row = Record<string, unknown> & { id: number };

type Target = {
  table: string;
  fields: string[];
  load: () => Promise<Row[]>;
  save: (id: number, data: Record<string, string>) => Promise<unknown>;
};

type Change = { table: string; id: number; field: string; before: string; after: string };

function selfTest(): never {
  const cases: [string, string][] = [
    ["ออเดอร์ใหม่", "ออเดอร์ใหม่"],
    ["\u{1F6D2} ออเดอร์ใหม่", "ออเดอร์ใหม่"],
    ["แก้ไข \u270F\uFE0F หน้านี้", "แก้ไข หน้านี้"],
    ["ขอใบเสนอราคา \u{1F4C4}", "ขอใบเสนอราคา "],
    ["Family \u{1F468}\u200D\u{1F469}\u200D\u{1F467} ok", "Family ok"],
    ["Flag \u{1F1F9}\u{1F1ED} ok", "Flag ok"],
    ["\u00A9 2026 MYPOS\u2122", "\u00A9 2026 MYPOS\u2122"],
    ["Admin \u2192 Content", "Admin \u2192 Content"],
    ["a\u200Bb", "a\u200Bb"],
  ];
  let failed = 0;
  for (const [input, expected] of cases) {
    const got = stripEmoji(input);
    const ok = got === expected && hasEmoji(input) === (input !== expected);
    if (!ok) {
      failed += 1;
      console.error(`FAIL: ${JSON.stringify(input)} -> ${JSON.stringify(got)} (expected ${JSON.stringify(expected)})`);
    }
  }
  console.log(failed ? `${failed} of ${cases.length} cases failed` : `All ${cases.length} cases passed`);
  process.exit(failed ? 1 : 0);
}

async function main() {
  if (process.argv.includes("--self-test")) selfTest();

  const write = process.argv.includes("--write");
  const prisma = new PrismaClient();

  const targets: Target[] = [
    { table: "PageContent", fields: ["value"], load: () => prisma.pageContent.findMany(), save: (id, data) => prisma.pageContent.update({ where: { id }, data }) },
    { table: "SiteSetting", fields: ["value"], load: () => prisma.siteSetting.findMany(), save: (id, data) => prisma.siteSetting.update({ where: { id }, data }) },
    { table: "ProductTranslation", fields: ["name", "highlight"], load: () => prisma.productTranslation.findMany(), save: (id, data) => prisma.productTranslation.update({ where: { id }, data }) },
    { table: "AccessoryTranslation", fields: ["name", "description"], load: () => prisma.accessoryTranslation.findMany(), save: (id, data) => prisma.accessoryTranslation.update({ where: { id }, data }) },
    { table: "ReferenceCaseTranslation", fields: ["business", "problem", "install", "result"], load: () => prisma.referenceCaseTranslation.findMany(), save: (id, data) => prisma.referenceCaseTranslation.update({ where: { id }, data }) },
    { table: "KbCategoryTranslation", fields: ["name"], load: () => prisma.kbCategoryTranslation.findMany(), save: (id, data) => prisma.kbCategoryTranslation.update({ where: { id }, data }) },
    { table: "KbArticleTranslation", fields: ["title", "summary", "body"], load: () => prisma.kbArticleTranslation.findMany(), save: (id, data) => prisma.kbArticleTranslation.update({ where: { id }, data }) },
    { table: "BlogPostTranslation", fields: ["title", "excerpt", "body"], load: () => prisma.blogPostTranslation.findMany(), save: (id, data) => prisma.blogPostTranslation.update({ where: { id }, data }) },
    { table: "JobPostingTranslation", fields: ["title", "description"], load: () => prisma.jobPostingTranslation.findMany(), save: (id, data) => prisma.jobPostingTranslation.update({ where: { id }, data }) },
    { table: "TrustLogo", fields: ["name"], load: () => prisma.trustLogo.findMany(), save: (id, data) => prisma.trustLogo.update({ where: { id }, data }) },
    { table: "OfficialPartner", fields: ["name"], load: () => prisma.officialPartner.findMany(), save: (id, data) => prisma.officialPartner.update({ where: { id }, data }) },
  ];

  try {
    const changes: Change[] = [];
    const byRow = new Map<string, { target: Target; id: number; data: Record<string, string> }>();

    for (const target of targets) {
      const rows = await target.load();
      for (const row of rows) {
        for (const field of target.fields) {
          const before = row[field];
          if (typeof before !== "string" || !hasEmoji(before)) continue;
          const after = stripEmoji(before);
          changes.push({ table: target.table, id: row.id, field, before, after });
          const key = `${target.table}:${row.id}`;
          const entry = byRow.get(key) ?? { target, id: row.id, data: {} };
          entry.data[field] = after;
          byRow.set(key, entry);
        }
      }
    }

    if (changes.length === 0) {
      console.log("No emoji found in the database. Nothing to do.");
      return;
    }

    const preview = (text: string) => JSON.stringify(text.length > 90 ? `${text.slice(0, 90)}...` : text);
    for (const change of changes) {
      console.log(`${change.table} #${change.id}.${change.field}\n  before: ${preview(change.before)}\n  after:  ${preview(change.after)}`);
    }
    console.log(`\n${changes.length} field(s) in ${byRow.size} row(s) contain emoji.`);

    if (!write) {
      console.log("Dry run: nothing was written. Re-run with --write to back up and apply.");
      return;
    }

    const backupDir = path.join(__dirname, "backups");
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `strip-emoji-${stamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(changes, null, 2), "utf8");
    console.log(`Backup written: ${backupFile}`);

    for (const { target, id, data } of byRow.values()) {
      await target.save(id, data);
    }
    console.log(`Updated ${byRow.size} row(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
