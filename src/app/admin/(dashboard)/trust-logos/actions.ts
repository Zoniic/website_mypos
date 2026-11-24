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

function revalidateHome() {
  revalidatePath("/[locale]", "page");
}

export async function createTrustLogo(_prevState: string | null, formData: FormData) {
  const admin = await requireAdmin();
  const emojiError = emojiFormError(formData);
  if (emojiError) return emojiError;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return "Name is required.";

  let imageUrl: string | null;
  try {
    imageUrl = await saveUploadedImage(
      formData.get("image") as File | null,
      "trust-logos",
      name
    );
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

  const count = await prisma.trustLogo.count();
  const created = await prisma.trustLogo.create({ data: { name, imageUrl, sortOrder: count } });

  revalidateHome();
  await auditEntity(admin, "TrustLogo", null, await loadSnapshot("TrustLogo", created.id));
  redirect("/admin/trust-logos");
}

export async function updateTrustLogo(
  logoId: number,
  _prevState: string | null,
  formData: FormData
) {
  const admin = await requireAdmin();
  const before = await loadSnapshot("TrustLogo", logoId);
  const emojiError = emojiFormError(formData);
  if (emojiError) return emojiError;
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return "Name is required.";

  const existing = await prisma.trustLogo.findUnique({ where: { id: logoId } });
  if (!existing) return "Not found.";

  let imageUrl = existing.imageUrl;
  try {
    const newUrl = await saveUploadedImage(
      formData.get("image") as File | null,
      "trust-logos",
      name
    );
    if (newUrl) imageUrl = newUrl;
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

  await prisma.trustLogo.update({ where: { id: logoId }, data: { name, imageUrl } });

  if (existing.imageUrl !== imageUrl) await trashReplacedFiles([existing.imageUrl]);

  revalidateHome();
  await auditEntity(admin, "TrustLogo", before, await loadSnapshot("TrustLogo", logoId));
  redirect("/admin/trust-logos");
}

export async function deleteTrustLogo(logoId: number) {
  const admin = await requireAdmin();
  const before = await loadSnapshot("TrustLogo", logoId);
  const deleted = await prisma.trustLogo.delete({ where: { id: logoId } });
  await auditEntity(admin, "TrustLogo", before, null);
  await trashReplacedFiles([deleted.imageUrl]);
  revalidateHome();
  redirect("/admin/trust-logos");
}
