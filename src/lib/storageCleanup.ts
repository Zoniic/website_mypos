import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin, SUPABASE_STORAGE_BUCKET } from "@/lib/supabase";

/**
 * Cleanup of Supabase Storage files that no record uses any more (after a
 * replace or a delete). It is a move, not a delete: files go to
 * `_trash/<yyyymm>/<original path>` in the same bucket so a mistake can be
 * undone (see prisma/find-orphan-uploads.ts --restore). It is best effort:
 * failures are logged and never thrown, so a record save/delete never fails
 * because of storage. A file that any record still references is kept.
 */

export const TRASH_PREFIX = "_trash/";

export type CleanupResult = {
  moved: string[];
  keptReferenced: string[];
  ignored: string[];
  failed: string[];
};

export type CleanupDeps = {
  /** Public Supabase project URL, e.g. https://abc.supabase.co */
  supabaseUrl: string | undefined;
  bucket: string;
  /** True when any record still points at this object path. */
  isReferenced: (path: string) => Promise<boolean>;
  move: (from: string, to: string) => Promise<void>;
  now: () => Date;
  log: (message: string, error?: unknown) => void;
};

/**
 * Object path inside the bucket for a public URL of OUR project and bucket,
 * or null for anything else (external URLs, /images/..., already in _trash).
 */
export function storagePathFromUrl(
  url: string | null | undefined,
  supabaseUrl: string | undefined,
  bucket: string
): string | null {
  if (!url || !supabaseUrl) return null;
  let parsed: URL;
  let base: URL;
  try {
    parsed = new URL(url);
    base = new URL(supabaseUrl);
  } catch {
    return null;
  }
  if (parsed.host !== base.host) return null;
  const prefix = `/storage/v1/object/public/${bucket}/`;
  if (!parsed.pathname.startsWith(prefix)) return null;
  let path: string;
  try {
    path = decodeURIComponent(parsed.pathname.slice(prefix.length));
  } catch {
    return null;
  }
  if (!path || path.startsWith(TRASH_PREFIX) || path.split("/").includes("..")) return null;
  return path;
}

/** Splits a comma-separated URL list (Product.galleryUrls). */
export function splitUrlList(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function trashPath(path: string, now: Date): string {
  const month = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  return `${TRASH_PREFIX}${month}/${path}`;
}

/** Pure core: moves the unreferenced candidates to _trash, never throws. */
export async function trashUnreferencedUrls(
  candidateUrls: Array<string | null | undefined>,
  deps: CleanupDeps
): Promise<CleanupResult> {
  const result: CleanupResult = { moved: [], keptReferenced: [], ignored: [], failed: [] };
  const seen = new Set<string>();
  for (const url of candidateUrls) {
    if (!url) continue;
    const path = storagePathFromUrl(url, deps.supabaseUrl, deps.bucket);
    if (!path) {
      result.ignored.push(url);
      continue;
    }
    if (seen.has(path)) continue;
    seen.add(path);
    try {
      if (await deps.isReferenced(path)) {
        result.keptReferenced.push(path);
        continue;
      }
      await deps.move(path, trashPath(path, deps.now()));
      result.moved.push(path);
    } catch (error) {
      // Unknown reference state or a failed move: keep the file (an orphan is
      // better than a broken link).
      result.failed.push(path);
      deps.log(`[storageCleanup] could not trash ${path}`, error);
    }
  }
  return result;
}

/**
 * True when the object path appears in any URL-bearing field. The public URL
 * ends with the path, so a substring match works for single URLs, the
 * comma-separated gallery list, settings and page copy.
 */
export async function isStoragePathReferenced(path: string): Promise<boolean> {
  const has = { contains: path };
  const checks = await Promise.all([
    prisma.product.findFirst({
      where: { OR: [{ imageUrl: has }, { galleryUrls: has }, { datasheetUrl: has }] },
      select: { id: true },
    }),
    prisma.accessory.findFirst({
      where: { OR: [{ imageUrl: has }, { galleryUrls: has }, { datasheetUrl: has }] },
      select: { id: true },
    }),
    prisma.referenceCase.findFirst({
      where: { OR: [{ imageUrl: has }, { logoUrl: has }] },
      select: { id: true },
    }),
    prisma.trustLogo.findFirst({ where: { imageUrl: has }, select: { id: true } }),
    prisma.officialPartner.findFirst({ where: { imageUrl: has }, select: { id: true } }),
    prisma.kbArticle.findFirst({
      where: { OR: [{ coverImageUrl: has }, { pdfUrl: has }] },
      select: { id: true },
    }),
    prisma.blogPost.findFirst({ where: { coverImageUrl: has }, select: { id: true } }),
    prisma.siteImage.findFirst({ where: { url: has }, select: { id: true } }),
    prisma.siteSetting.findFirst({ where: { value: has }, select: { id: true } }),
    prisma.pageContent.findFirst({ where: { value: has }, select: { id: true } }),
    prisma.blogPostTranslation.findFirst({ where: { body: has }, select: { id: true } }),
    prisma.kbArticleTranslation.findFirst({ where: { body: has }, select: { id: true } }),
  ]);
  return checks.some(Boolean);
}

/**
 * Call AFTER the database write succeeded, with the URLs that the write
 * removed from a record (old image on replace, all images of a deleted row).
 * Never throws.
 */
export async function trashReplacedFiles(
  oldUrls: Array<string | null | undefined>
): Promise<void> {
  try {
    const result = await trashUnreferencedUrls(oldUrls, {
      supabaseUrl: process.env.SUPABASE_URL,
      bucket: SUPABASE_STORAGE_BUCKET,
      isReferenced: isStoragePathReferenced,
      move: async (from, to) => {
        const { error } = await getSupabaseAdmin().storage
          .from(SUPABASE_STORAGE_BUCKET)
          .move(from, to);
        if (error) throw new Error(error.message);
      },
      now: () => new Date(),
      log: (message, error) => console.error(message, error),
    });
    if (result.moved.length > 0) {
      console.info(`[storageCleanup] moved to ${TRASH_PREFIX}: ${result.moved.join(", ")}`);
    }
  } catch (error) {
    console.error("[storageCleanup] cleanup failed", error);
  }
}
