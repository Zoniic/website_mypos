/**
 * Hides the "test" product from the public site without deleting it, by
 * listing its slug in the SiteSetting row `hiddenProductSlugs` (Product has
 * no publish flag; see src/lib/hiddenProducts.ts). Hidden products are left
 * out of /products, the detail page (404), search, solution model tables,
 * the sitemap, the shop and the product feed.
 *
 * Safe by default:
 *   - dry run: says what would change and writes nothing;
 *   - with --write, the Product row (with translations) and the current
 *     SiteSetting row are saved to prisma/backups/hide-test-product-<timestamp>.json first;
 *   - idempotent: a second run finds nothing to change.
 *
 * Run:
 *   npx tsx prisma/hide-test-product.ts                      (dry run)
 *   npx tsx prisma/hide-test-product.ts --write              (backup, then hide)
 *   npx tsx prisma/hide-test-product.ts --restore --write    (show it again)
 *
 * The public site caches this list for up to 5 minutes; restart the server
 * or save any page in the admin to see the change right away.
 */
import { auditScriptRun } from "./script-audit";
import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import { HIDDEN_PRODUCTS_KEY, parseHiddenSlugs } from "../src/lib/hiddenProducts";

const SLUG = "test";

async function main() {
  const write = process.argv.includes("--write");
  const restore = process.argv.includes("--restore");
  const prisma = new PrismaClient();
  try {
    const product = await prisma.product.findUnique({ where: { slug: SLUG }, include: { translations: true } });
    if (!product) {
      console.log(`No product with slug "${SLUG}" (already renamed or deleted). Nothing to do.`);
      return;
    }
    const row = await prisma.siteSetting.findUnique({ where: { key: HIDDEN_PRODUCTS_KEY } });
    const current = parseHiddenSlugs(row?.value);
    const next = restore ? current.filter((s) => s !== SLUG) : current.includes(SLUG) ? current : [...current, SLUG];

    if (next.join(",") === current.join(",")) {
      console.log(restore ? `"${SLUG}" is not hidden. Nothing to do.` : `"${SLUG}" is already hidden. Nothing to do.`);
      return;
    }
    console.log(`${HIDDEN_PRODUCTS_KEY}: ${JSON.stringify(current.join(","))} -> ${JSON.stringify(next.join(","))}`);
    if (!write) {
      console.log("Dry run: nothing written. Re-run with --write to apply.");
      return;
    }

    const dir = path.join(__dirname, "backups");
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `hide-test-product-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(file, JSON.stringify({ product, siteSetting: row }, null, 2));
    console.log(`Backup written: ${file}`);

    await prisma.siteSetting.upsert({
      where: { key: HIDDEN_PRODUCTS_KEY },
      update: { value: next.join(",") },
      create: { key: HIDDEN_PRODUCTS_KEY, value: next.join(",") },
    });
    console.log("Applied.");
    await auditScriptRun(prisma, "hide-test-product", 1, file);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
