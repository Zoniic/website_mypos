import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({
    include: { translations: { where: { locale: "th" } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="rounded-button bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
        >
          + New Post
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-0 text-text-2">
            <tr>
              <th className="px-4 py-3 font-medium">Cover</th>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Featured</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-3">
                  <div className="relative h-10 w-16 overflow-hidden rounded-md bg-surface-0">
                    {post.coverImageUrl && (
                      <Image src={post.coverImageUrl} alt="" fill sizes="64px" className="object-cover" />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{post.translations[0]?.title}</td>
                <td className="px-4 py-3 font-mono text-text-2">{post.slug}</td>
                <td className="px-4 py-3">{post.featured ? "Yes" : ""}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/blog/${post.id}/edit`} className="text-primary-600 hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
