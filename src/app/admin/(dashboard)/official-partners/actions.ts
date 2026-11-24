"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { emojiFormError } from "@/lib/emoji";
// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auditEntity, loadSnapshot } from "@/lib/auditLog";
import { saveUploadedImage } from "@/lib/uploads";
import { trashReplacedFiles } from "@/lib/storageCleanup";

function revalidateAbout() {
  revalidatePath("/[locale]/about", "page");
}

export async function createOfficialPartner(_prevState: string | null, formData: FormData) {
  const admin = await requireAdmin();
  const emojiError = emojiFormError(formData);
  if (emojiError) return emojiError;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return "Name is required.";
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim() || null;

  let imageUrl: string | null;
  try {
    imageUrl = await saveUploadedImage(
      formData.get("image") as File | null,
      "official-partners",
      name
    );
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

  const count = await prisma.officialPartner.count();
  const created = await prisma.officialPartner.create({ data: { name, imageUrl, websiteUrl, sortOrder: count } });

  revalidateAbout();
  await auditEntity(admin, "OfficialPartner", null, await loadSnapshot("OfficialPartner", created.id));
  redirect("/admin/official-partners");
}

export async function updateOfficialPartner(
  partnerId: number,
  _prevState: string | null,
  formData: FormData
) {
  const admin = await requireAdmin();
  const before = await loadSnapshot("OfficialPartner", partnerId);
  const emojiError = emojiFormError(formData);
  if (emojiError) return emojiError;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return "Name is required.";
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim() || null;

  const existing = await prisma.officialPartner.findUnique({ where: { id: partnerId } });
  if (!existing) return "Not found.";

  let imageUrl = existing.imageUrl;
  try {
    const newUrl = await saveUploadedImage(
      formData.get("image") as File | null,
      "official-partners",
      name
    );
    if (newUrl) imageUrl = newUrl;
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

  await prisma.officialPartner.update({
    where: { id: partnerId },
    data: { name, imageUrl, websiteUrl },
  });

  if (existing.imageUrl !== imageUrl) await trashReplacedFiles([existing.imageUrl]);

  revalidateAbout();
  await auditEntity(admin, "OfficialPartner", before, await loadSnapshot("OfficialPartner", partnerId));
  redirect("/admin/official-partners");
}

export async function deleteOfficialPartner(partnerId: number) {
  const admin = await requireAdmin();
  const before = await loadSnapshot("OfficialPartner", partnerId);
  const deleted = await prisma.officialPartner.delete({ where: { id: partnerId } });
  await auditEntity(admin, "OfficialPartner", before, null);
  await trashReplacedFiles([deleted.imageUrl]);
  revalidateAbout();
  redirect("/admin/official-partners");
}
