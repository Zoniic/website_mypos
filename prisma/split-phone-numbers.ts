/**
 * The owner chose to show two numbers (2026-11-21): the office line and a
 * sales mobile. Until now Site Settings had the office number as display text
 * ("02 521 7155-59") but the mobile as the tel: target ("086 688 9050"), so
 * visitors saw one number and dialled another.
 *
 * This script:
 *   - sets `phone` (office tel: target) to "02 521 7155" and `salesPhone` to
 *     "086 688 9050"; `phoneDisplay` stays "02 521 7155-59";
 *   - adds the footer.phoneOffice / footer.phoneSales labels (th/en/zh) to
 *     Page Content (messages/*.json is only the seed).
 *
 * Safe by default:
 *   - dry run lists what would change and writes nothing;
 *   - with --write, the current phone values are first saved to
 *     prisma/backups/split-phone-numbers-<timestamp>.json;
 *   - a phone value that is no longer the expected old one is left alone;
 *   - idempotent: a second run finds nothing to change.
 *
 * Run:
 *   npx tsx prisma/split-phone-numbers.ts          (dry run)
 *   npx tsx prisma/split-phone-numbers.ts --write  (backup, then update)
 *
 * The public site caches settings and copy for up to 5 minutes after a
 * direct database write.
 */
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const OLD_PHONE = "086 688 9050";
const OFFICE_TEL = "02 521 7155";
const SALES_PHONE = "086 688 9050";

const LABELS: Record<string, Record<"th" | "en" | "zh", string>> = {
  phoneOffice: { th: "สำนักงาน", en: "Office", zh: "办公室" },
  phoneSales: { th: "ฝ่ายขาย", en: "Sales", zh: "销售" },
};

const digits = (value: string) => value.replace(/\D/g, "");

async function main() {
  const write = process.argv.includes("--write");
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: ["phone", "phoneDisplay", "salesPhone"] } } });
    const current = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    const settingChanges: { key: string; from: string | null; to: string }[] = [];

    if ((current.salesPhone ?? "").trim() === "") {
      settingChanges.push({ key: "salesPhone", from: current.salesPhone ?? null, to: SALES_PHONE });
    }
    const phone = (current.phone ?? "").trim();
    if (digits(phone) === digits(OLD_PHONE)) {
      settingChanges.push({ key: "phone", from: current.phone ?? null, to: OFFICE_TEL });
    } else if (digits(phone) !== digits(OFFICE_TEL)) {
      console.log(`phone is ${JSON.stringify(phone)}, not the expected old value: left unchanged.`);
    }

    const copyRows = await prisma.pageContent.findMany({ where: { namespace: "footer", key: { in: Object.keys(LABELS) } } });
    const copyChanges: { key: string; locale: string; value: string }[] = [];
    for (const [key, byLocale] of Object.entries(LABELS)) {
      for (const [locale, value] of Object.entries(byLocale)) {
        const row = copyRows.find((r) => r.key === key && r.locale === locale);
        if (row?.value !== value) copyChanges.push({ key, locale, value });
      }
    }

    for (const c of settingChanges) console.log(`SiteSetting ${c.key}: ${JSON.stringify(c.from)} -> ${JSON.stringify(c.to)}`);
    for (const c of copyChanges) console.log(`PageContent footer.${c.key} (${c.locale}): -> ${JSON.stringify(c.value)}`);
    if (!settingChanges.length && !copyChanges.length) {
      console.log("Nothing to change.");
      return;
    }
    if (!write) {
      console.log("Dry run: nothing was written. Re-run with --write to back up and apply.");
      return;
    }

    const backupDir = path.join(__dirname, "backups");
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(backupDir, `split-phone-numbers-${stamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify({ settings: current, copy: copyRows }, null, 2), "utf8");
    console.log(`Backup written: ${backupFile}`);

    for (const c of settingChanges) {
      await prisma.siteSetting.upsert({ where: { key: c.key }, create: { key: c.key, value: c.to }, update: { value: c.to } });
    }
    for (const c of copyChanges) {
      await prisma.pageContent.upsert({
        where: { namespace_key_locale: { namespace: "footer", key: c.key, locale: c.locale } },
        create: { namespace: "footer", key: c.key, locale: c.locale, value: c.value },
        update: { value: c.value },
      });
    }
    console.log(`Updated ${settingChanges.length} setting(s) and ${copyChanges.length} copy row(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
