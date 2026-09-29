import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

/**
 * Edit-mode shortcut: public cards know an item's slug, admin edit pages use
 * its id. /admin/goto/<kind>/<slug> looks it up and opens the edit page.
 */
const finders: Record<string, (slug: string) => Promise<{ id: number } | null>> = {
  product: (slug) => prisma.product.findUnique({ where: { slug }, select: { id: true } }),
  accessory: (slug) => prisma.accessory.findUnique({ where: { slug }, select: { id: true } }),
  blog: (slug) => prisma.blogPost.findUnique({ where: { slug }, select: { id: true } }),
  reference: (slug) => prisma.referenceCase.findUnique({ where: { slug }, select: { id: true } }),
};

const editPaths: Record<string, string> = {
  product: "/admin/products",
  accessory: "/admin/accessories",
  blog: "/admin/blog",
  reference: "/admin/references",
};

export async function GET(_request: Request, { params }: { params: Promise<{ kind: string; slug: string }> }) {
  await requireAdmin();
  const { kind, slug } = await params;
  const find = finders[kind];
  if (!find) redirect("/admin");
  const item = await find(decodeURIComponent(slug));
  redirect(item ? `${editPaths[kind]}/${item.id}/edit` : editPaths[kind]);
}
