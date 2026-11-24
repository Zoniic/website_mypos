"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { emojiFormError } from "@/lib/emoji";
// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auditEntity, loadSnapshot } from "@/lib/auditLog";
import { saveUploadedImage, saveUploadedPdf } from "@/lib/uploads";
import { splitUrlList, trashReplacedFiles } from "@/lib/storageCleanup";
import { slugFormError } from "@/lib/slug";

const locales = ["th", "en", "zh"] as const;
const GALLERY_SLOTS = 3;
const STOCK_STATUSES = new Set(["in_stock", "preorder", "out_of_stock"]);
const MAX_SPECS_CHARS = 4000;

function revalidateAccessoryPaths() {
  revalidatePath("/[locale]/accessories", "page");
  revalidatePath("/[locale]/accessories/[slug]", "page");
  // Product pages list the accessories that work with them.
  revalidatePath("/[locale]/products/[slug]", "page");
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

/** A whole number above 0, else null. */
function positiveInt(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  return /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : null;
}

/** Prices, stock, video and marketplace links; invalid/empty values become null. */
function readFields(formData: FormData) {
  const url = (key: string) => {
    const value = String(formData.get(key) ?? "").trim();
    return /^https:\/\/\S+$/.test(value) ? value : null;
  };
  const stockStatus = String(formData.get("stockStatus") ?? "in_stock");
  return {
    onlinePrice: positiveInt(formData, "onlinePrice"),
    shopeeUrl: url("shopeeUrl"),
    lazadaUrl: url("lazadaUrl"),
    priceFrom: positiveInt(formData, "priceFrom"),
    stockStatus: STOCK_STATUSES.has(stockStatus) ? stockStatus : "in_stock",
    leadTimeDays: positiveInt(formData, "leadTimeDays"),
    videoUrl: url("videoUrl"),
  };
}

function readSlugList(formData: FormData, key: string): string[] {
  return [...new Set(formData.getAll(key).map((v) => String(v).trim()).filter(Boolean))];
}

function readTranslation(formData: FormData, locale: string) {
  return {
    name: String(formData.get(`name_${locale}`) ?? "").trim(),
    description: String(formData.get(`description_${locale}`) ?? "").trim(),
    specs: String(formData.get(`specs_${locale}`) ?? "").trim().slice(0, MAX_SPECS_CHARS),
  };
}

/** Uploads new files; empty inputs keep the stored file. Throws a user-facing message on a bad file. */
async function readFiles(
  formData: FormData,
  slug: string,
  existing: { imageUrl: string | null; galleryUrls: string[]; datasheetUrl: string | null },
) {
  const imageUrl = (await saveUploadedImage(formData.get("image") as File | null, "accessories", slug)) ?? existing.imageUrl;
  const galleryUrls: string[] = [];
  for (let i = 0; i < GALLERY_SLOTS; i++) {
    const file = formData.get(`galleryImage${i + 1}`) as File | null;
    const url = (await saveUploadedImage(file, "accessories", `${slug}-gallery-${i + 1}`)) ?? existing.galleryUrls[i];
    if (url) galleryUrls.push(url);
  }
  const datasheetUrl =
    (await saveUploadedPdf(formData.get("datasheet") as File | null, "accessories", `${slug}-datasheet`)) ??
    existing.datasheetUrl;
  return { imageUrl, galleryUrls: galleryUrls.join(","), datasheetUrl };
}

export async function createAccessory(_prevState: string | null, formData: FormData) {
  const admin = await requireAdmin();
  const emojiError = emojiFormError(formData);
  if (emojiError) return emojiError;
  const slug = String(formData.get("slug") ?? "").trim();
  const slugError = slugFormError(slug);
  if (slugError) return slugError;
  if (!String(formData.get("name_th") ?? "").trim()) return "Thai name is required.";
  const categories = readSlugList(formData, "categories");
  const compatibleSlugs = readSlugList(formData, "compatibleSlugs");

  let files: Awaited<ReturnType<typeof readFiles>>;
  try {
    files = await readFiles(formData, slug, { imageUrl: null, galleryUrls: [], datasheetUrl: null });
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload file.";
  }
  if (!files.imageUrl) return "Photo is required.";

  const count = await prisma.accessory.count();
  let accessory;
  try {
    accessory = await prisma.accessory.create({
      data: {
        slug,
        sortOrder: count,
        ...files,
        ...readFields(formData),
        categories: { connect: categories.map((slug) => ({ slug })) },
        compatibleProducts: { connect: compatibleSlugs.map((slug) => ({ slug })) },
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.accessoryTranslation.create({
      data: { accessoryId: accessory.id, locale, ...readTranslation(formData, locale) },
    });
  }

  revalidateAccessoryPaths();
  await auditEntity(admin, "Accessory", null, await loadSnapshot("Accessory", accessory.id));
  redirect("/admin/accessories");
}

export async function updateAccessory(
  accessoryId: number,
  _prevState: string | null,
  formData: FormData
) {
  const admin = await requireAdmin();
  const before = await loadSnapshot("Accessory", accessoryId);
  const emojiError = emojiFormError(formData);
  if (emojiError) return emojiError;
  const slug = String(formData.get("slug") ?? "").trim();
  const slugError = slugFormError(slug);
  if (slugError) return slugError;
  if (!String(formData.get("name_th") ?? "").trim()) return "Thai name is required.";
  const categories = readSlugList(formData, "categories");
  const compatibleSlugs = readSlugList(formData, "compatibleSlugs");

  const existing = await prisma.accessory.findUnique({ where: { id: accessoryId } });
  if (!existing) return "Accessory not found.";

  let files: Awaited<ReturnType<typeof readFiles>>;
  try {
    files = await readFiles(formData, slug, {
      imageUrl: existing.imageUrl,
      galleryUrls: splitUrlList(existing.galleryUrls),
      datasheetUrl: existing.datasheetUrl,
    });
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload file.";
  }
  if (!files.imageUrl) return "Photo is required.";

  try {
    await prisma.accessory.update({
      where: { id: accessoryId },
      data: {
        slug,
        ...files,
        ...readFields(formData),
        categories: { set: categories.map((slug) => ({ slug })) },
        compatibleProducts: { set: compatibleSlugs.map((slug) => ({ slug })) },
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    const translation = readTranslation(formData, locale);
    await prisma.accessoryTranslation.upsert({
      where: { accessoryId_locale: { accessoryId, locale } },
      create: { accessoryId, locale, ...translation },
      update: translation,
    });
  }

  const kept = new Set([files.imageUrl, ...splitUrlList(files.galleryUrls), files.datasheetUrl]);
  await trashReplacedFiles(
    [existing.imageUrl, ...splitUrlList(existing.galleryUrls), existing.datasheetUrl].filter((url) => !url || !kept.has(url))
  );

  revalidateAccessoryPaths();
  await auditEntity(admin, "Accessory", before, await loadSnapshot("Accessory", accessoryId));
  redirect("/admin/accessories");
}

export async function deleteAccessory(accessoryId: number) {
  const admin = await requireAdmin();
  const before = await loadSnapshot("Accessory", accessoryId);
  const deleted = await prisma.accessory.delete({ where: { id: accessoryId } });
  await auditEntity(admin, "Accessory", before, null);
  await trashReplacedFiles([deleted.imageUrl, ...splitUrlList(deleted.galleryUrls), deleted.datasheetUrl]);
  revalidateAccessoryPaths();
  redirect("/admin/accessories");
}
