"use server";

// Purges the public site cache as well as the given path (see lib/siteCache).
import { revalidatePath } from "@/lib/siteCache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { saveUploadedImage } from "@/lib/uploads";

const locales = ["th", "en", "zh"] as const;

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

function readPostFields(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    featured: formData.get("featured") === "on",
  };
}

function revalidateBlogPaths(slug?: string) {
  revalidatePath("/[locale]/blog", "page");
  if (slug) revalidatePath(`/[locale]/blog/${slug}`, "page");
}

export async function createBlogPost(_prevState: string | null, formData: FormData) {
  const fields = readPostFields(formData);
  if (!fields.slug) return "Slug is required.";
  if (!String(formData.get("title_th") ?? "").trim()) return "Thai title is required.";

  const coverFile = formData.get("coverImage") as File | null;
  let coverImageUrl: string | null;
  try {
    coverImageUrl = await saveUploadedImage(coverFile, "blog", `${fields.slug}-cover`);
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

  const count = await prisma.blogPost.count();
  let post;
  try {
    post = await prisma.blogPost.create({
      data: { ...fields, coverImageUrl, sortOrder: count },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${fields.slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.blogPostTranslation.create({
      data: {
        postId: post.id,
        locale,
        title: String(formData.get(`title_${locale}`) ?? "").trim(),
        excerpt: String(formData.get(`excerpt_${locale}`) ?? "").trim(),
        body: String(formData.get(`body_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateBlogPaths();
  redirect("/admin/blog");
}

export async function updateBlogPost(postId: number, _prevState: string | null, formData: FormData) {
  const fields = readPostFields(formData);
  if (!fields.slug) return "Slug is required.";
  if (!String(formData.get("title_th") ?? "").trim()) return "Thai title is required.";

  const existing = await prisma.blogPost.findUnique({ where: { id: postId } });
  if (!existing) return "Post not found.";

  const coverFile = formData.get("coverImage") as File | null;
  let coverImageUrl = existing.coverImageUrl;
  try {
    const newCoverUrl = await saveUploadedImage(coverFile, "blog", `${fields.slug}-cover`);
    if (newCoverUrl) coverImageUrl = newCoverUrl;
  } catch (error) {
    return error instanceof Error ? error.message : "Failed to upload image.";
  }

  try {
    await prisma.blogPost.update({ where: { id: postId }, data: { ...fields, coverImageUrl } });
  } catch (error) {
    if (isUniqueConstraintError(error)) return `Slug "${fields.slug}" is already in use.`;
    throw error;
  }

  for (const locale of locales) {
    await prisma.blogPostTranslation.upsert({
      where: { postId_locale: { postId, locale } },
      create: {
        postId,
        locale,
        title: String(formData.get(`title_${locale}`) ?? "").trim(),
        excerpt: String(formData.get(`excerpt_${locale}`) ?? "").trim(),
        body: String(formData.get(`body_${locale}`) ?? "").trim(),
      },
      update: {
        title: String(formData.get(`title_${locale}`) ?? "").trim(),
        excerpt: String(formData.get(`excerpt_${locale}`) ?? "").trim(),
        body: String(formData.get(`body_${locale}`) ?? "").trim(),
      },
    });
  }

  revalidateBlogPaths(fields.slug);
  redirect("/admin/blog");
}

export async function deleteBlogPost(postId: number) {
  await prisma.blogPost.delete({ where: { id: postId } });
  revalidateBlogPaths();
  redirect("/admin/blog");
}
