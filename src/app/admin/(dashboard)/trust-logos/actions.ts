"use server";

// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";

function revalidateHome() {
  revalidatePath("/[locale]", "page");
}

export async function createTrustLogo(_prevState: string | null, formData: FormData) {
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
  await prisma.trustLogo.create({ data: { name, imageUrl, sortOrder: count } });

  revalidateHome();
  redirect("/admin/trust-logos");
}

export async function updateTrustLogo(
  logoId: number,
  _prevState: string | null,
  formData: FormData
) {
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

  revalidateHome();
  redirect("/admin/trust-logos");
}

export async function deleteTrustLogo(logoId: number) {
  await prisma.trustLogo.delete({ where: { id: logoId } });
  revalidateHome();
  redirect("/admin/trust-logos");
}
