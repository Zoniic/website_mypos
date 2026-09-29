import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BlogPostForm, type BlogPostFormValues } from "../../BlogPostForm";
import { deleteBlogPost, updateBlogPost } from "../../actions";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const postId = Number(id);

  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    include: { translations: true },
  });

  if (!post) notFound();

  const findTranslation = (locale: string) =>
    post.translations.find((t) => t.locale === locale) ?? { title: "", excerpt: "", body: "" };

  const initialValues: BlogPostFormValues = {
    slug: post.slug,
    featured: post.featured,
    coverImageUrl: post.coverImageUrl,
    translations: {
      th: findTranslation("th"),
      en: findTranslation("en"),
      zh: findTranslation("zh"),
    },
  };

  const boundUpdate = updateBlogPost.bind(null, postId);
  const boundDelete = deleteBlogPost.bind(null, postId);

  return (
    <div>
      <h1 className="text-2xl font-bold">แก้ไขบทความ</h1>
      <div className="mt-6">
        <BlogPostForm action={boundUpdate} initialValues={initialValues} submitLabel="บันทึก" />
      </div>

      <form action={boundDelete} className="mt-10 border-t border-border pt-6">
        <button
          type="submit"
          className="rounded-button border border-error px-4 py-2 text-sm font-semibold text-error hover:bg-error/10"
        >
          Delete Post
        </button>
      </form>
    </div>
  );
}
