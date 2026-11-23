/**
 * Finds files in the Supabase Storage bucket that no record references any
 * more (left behind by replaced images and deleted records, and by uploads
 * whose save failed), and optionally moves them to `_trash/`.
 *
 * Safe by default (same convention as the other prisma/ scripts):
 *   - dry run: lists the orphans, count and bytes per folder, and writes the
 *     report to prisma/backups/orphan-uploads-<timestamp>.json. Nothing in
 *     the bucket or the database changes;
 *   - with --write, the exact list of paths and sizes is first saved to
 *     prisma/backups/orphan-uploads-manifest-<timestamp>.json, then only
 *     those files are MOVED to _trash/<yyyymm>/<original path> (not deleted);
 *   - with --restore <manifest>, files from a manifest are moved back;
 *   - objects younger than 24 hours are skipped (an upload may not be saved
 *     to a record yet);
 *   - files under _trash/ are never touched. Emptying _trash is a manual
 *     step in the Supabase dashboard, after the owner has checked the site.
 *
 * Run:
 *   node node_modules/tsx/dist/cli.mjs prisma/find-orphan-uploads.ts                    (dry run)
 *   node node_modules/tsx/dist/cli.mjs prisma/find-orphan-uploads.ts --write            (manifest, then move)
 *   node node_modules/tsx/dist/cli.mjs prisma/find-orphan-uploads.ts --restore <file>   (move back)
 *   node node_modules/tsx/dist/cli.mjs prisma/find-orphan-uploads.ts --self-test        (no database, no Supabase)
 *
 * Needs DATABASE_URL, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (read from
 * .env.local / .env in the project root if not already set).
 */
import fs from "node:fs";
import path from "node:path";

export const FOLDERS = [
  "products",
  "accessories",
  "references",
  "blog",
  "kb",
  "trust-logos",
  "official-partners",
  "site",
  "hero",
] as const;

const MIN_AGE_MS = 24 * 60 * 60 * 1000;
const TRASH_PREFIX = "_trash/";

export type StoredObject = { path: string; size: number; createdAt: Date | null };
export type Orphan = { path: string; size: number; folder: string };

/** True when the object path occurs anywhere in the referenced text. */
export function isReferenced(objectPath: string, haystack: string): boolean {
  return haystack.includes(objectPath);
}

/** Pure core: which stored objects are not referenced and old enough. */
export function findOrphans(objects: StoredObject[], haystack: string, now: Date): Orphan[] {
  const orphans: Orphan[] = [];
  for (const object of objects) {
    if (object.path.startsWith(TRASH_PREFIX)) continue;
    if (object.createdAt && now.getTime() - object.createdAt.getTime() < MIN_AGE_MS) continue;
    // Unknown age (no timestamp): be conservative and skip.
    if (!object.createdAt) continue;
    if (isReferenced(object.path, haystack)) continue;
    orphans.push({ path: object.path, size: object.size, folder: object.path.split("/")[0] });
  }
  return orphans;
}

export function summarize(orphans: Orphan[]): Record<string, { count: number; bytes: number }> {
  const out: Record<string, { count: number; bytes: number }> = {};
  for (const o of orphans) {
    const entry = (out[o.folder] ??= { count: 0, bytes: 0 });
    entry.count++;
    entry.bytes += o.size;
  }
  return out;
}

export function trashPathFor(objectPath: string, now: Date): string {
  const month = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${TRASH_PREFIX}${month}/${objectPath}`;
}

function selfTest(): never {
  let failed = 0;
  const check = (name: string, ok: boolean) => {
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
    if (!ok) failed++;
  };
  const now = new Date("2026-11-24T12:00:00Z");
  const old = new Date("2026-11-01T00:00:00Z");
  const fresh = new Date("2026-11-24T06:00:00Z");
  const haystack = [
    "https://x.supabase.co/storage/v1/object/public/uploads/products/a-1.webp",
    "https://x.supabase.co/storage/v1/object/public/uploads/products/g-1.webp,https://x.supabase.co/storage/v1/object/public/uploads/products/g-2.webp",
    '{"hero":"https://x.supabase.co/storage/v1/object/public/uploads/hero/bg-3.mp4"}',
  ].join("\n");
  const objects: StoredObject[] = [
    { path: "products/a-1.webp", size: 10, createdAt: old },
    { path: "products/g-2.webp", size: 20, createdAt: old },
    { path: "hero/bg-3.mp4", size: 30, createdAt: old },
    { path: "products/orphan-1.webp", size: 40, createdAt: old },
    { path: "site/orphan-2.webp", size: 50, createdAt: old },
    { path: "site/fresh.webp", size: 60, createdAt: fresh },
    { path: "site/no-date.webp", size: 70, createdAt: null },
    { path: "_trash/202611/products/x.webp", size: 80, createdAt: old },
  ];
  const orphans = findOrphans(objects, haystack, now);
  check("referenced files are not orphans", !orphans.some((o) => ["products/a-1.webp", "products/g-2.webp", "hero/bg-3.mp4"].includes(o.path)));
  check("unreferenced old files are orphans", orphans.map((o) => o.path).join() === "products/orphan-1.webp,site/orphan-2.webp");
  check("files younger than 24h are skipped", !orphans.some((o) => o.path === "site/fresh.webp"));
  check("files with unknown age are skipped", !orphans.some((o) => o.path === "site/no-date.webp"));
  check("_trash is never touched", !orphans.some((o) => o.path.startsWith("_trash/")));
  const s = summarize(orphans);
  check("summary counts per folder", s.products?.count === 1 && s.site?.bytes === 50);
  check("trash path", trashPathFor("site/a.webp", now) === "_trash/202611/site/a.webp");
  console.log(failed === 0 ? "\nAll checks passed." : `\n${failed} check(s) FAILED.`);
  process.exit(failed === 0 ? 0 : 1);
}

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const full = path.resolve(process.cwd(), file);
    if (fs.existsSync(full)) process.loadEnvFile(full);
  }
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function writeBackup(name: string, data: unknown): string {
  const dir = path.resolve(process.cwd(), "prisma", "backups");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}-${timestamp()}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
  return file;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) selfTest();
  loadEnv();
  const write = args.includes("--write");
  const restoreIndex = args.indexOf("--restore");

  const { getSupabaseAdmin, SUPABASE_STORAGE_BUCKET } = await import("../src/lib/supabase");
  const storage = getSupabaseAdmin().storage.from(SUPABASE_STORAGE_BUCKET);

  if (restoreIndex !== -1) {
    const manifestPath = args[restoreIndex + 1];
    if (!manifestPath) throw new Error("--restore needs a manifest file path");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      files: { path: string; trashPath: string }[];
    };
    let restored = 0;
    for (const f of manifest.files) {
      const { error } = await storage.move(f.trashPath, f.path);
      if (error) console.error(`FAILED ${f.trashPath}: ${error.message}`);
      else restored++;
    }
    console.log(`Restored ${restored} of ${manifest.files.length} files.`);
    return;
  }

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    // 1) Everything that can reference a stored file, as one searchable text.
    const parts: string[] = [];
    const add = (...values: (string | null | undefined)[]) => {
      for (const v of values) if (v) parts.push(v);
    };
    for (const r of await prisma.product.findMany({ select: { imageUrl: true, galleryUrls: true, datasheetUrl: true } }))
      add(r.imageUrl, r.galleryUrls, r.datasheetUrl);
    for (const r of await prisma.accessory.findMany({ select: { imageUrl: true } })) add(r.imageUrl);
    for (const r of await prisma.referenceCase.findMany({ select: { imageUrl: true, logoUrl: true } })) add(r.imageUrl, r.logoUrl);
    for (const r of await prisma.trustLogo.findMany({ select: { imageUrl: true } })) add(r.imageUrl);
    for (const r of await prisma.officialPartner.findMany({ select: { imageUrl: true } })) add(r.imageUrl);
    for (const r of await prisma.kbArticle.findMany({ select: { coverImageUrl: true, pdfUrl: true } })) add(r.coverImageUrl, r.pdfUrl);
    for (const r of await prisma.blogPost.findMany({ select: { coverImageUrl: true } })) add(r.coverImageUrl);
    for (const r of await prisma.siteImage.findMany({ select: { url: true } })) add(r.url);
    for (const r of await prisma.siteSetting.findMany({ select: { value: true } })) add(r.value);
    for (const r of await prisma.pageContent.findMany({ select: { value: true } })) add(r.value);
    for (const r of await prisma.blogPostTranslation.findMany({ select: { body: true } })) add(r.body);
    for (const r of await prisma.kbArticleTranslation.findMany({ select: { body: true } })) add(r.body);
    const haystack = parts.join("\n");

    // 2) Everything in the bucket (read only).
    const objects: StoredObject[] = [];
    for (const folder of FOLDERS) {
      for (let offset = 0; ; offset += 100) {
        const { data, error } = await storage.list(folder, { limit: 100, offset });
        if (error) throw new Error(`list ${folder}: ${error.message}`);
        if (!data || data.length === 0) break;
        for (const entry of data) {
          if (!entry.id) continue; // a sub-folder placeholder
          const meta = (entry.metadata ?? {}) as { size?: number };
          const created = entry.created_at ? new Date(entry.created_at) : null;
          objects.push({ path: `${folder}/${entry.name}`, size: meta.size ?? 0, createdAt: created });
        }
        if (data.length < 100) break;
      }
    }

    const now = new Date();
    const orphans = findOrphans(objects, haystack, now);
    const summary = summarize(orphans);
    console.log(`Bucket objects scanned: ${objects.length}`);
    console.log(`Orphans: ${orphans.length}`);
    for (const [folder, v] of Object.entries(summary)) {
      console.log(`  ${folder}: ${v.count} files, ${(v.bytes / 1024 / 1024).toFixed(2)} MB`);
    }
    const reportFile = writeBackup("orphan-uploads", { scannedAt: now.toISOString(), bucket: SUPABASE_STORAGE_BUCKET, summary, orphans });
    console.log(`Report: ${reportFile}`);

    if (!write) {
      console.log("\nDry run: nothing was moved. Re-run with --write to move these files to _trash/.");
      return;
    }
    const files = orphans.map((o) => ({ path: o.path, size: o.size, trashPath: trashPathFor(o.path, now) }));
    const manifestFile = writeBackup("orphan-uploads-manifest", { movedAt: now.toISOString(), files });
    console.log(`Manifest saved: ${manifestFile}`);
    let moved = 0;
    for (const f of files) {
      const { error } = await storage.move(f.path, f.trashPath);
      if (error) console.error(`FAILED ${f.path}: ${error.message}`);
      else moved++;
    }
    console.log(`Moved ${moved} of ${files.length} files to _trash/. Undo with --restore ${manifestFile}`);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && /find-orphan-uploads/.test(process.argv[1])) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
