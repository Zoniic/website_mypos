import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { decodeSlugParam, slugKey } from "@/lib/slug";

/**
 * Edit-mode shortcut: public cards know an item's slug, admin edit pages use
 * its id. /admin/goto/<kind>/<slug> looks it up and opens the edit page.
 */
/** Exact slug, then an old-style one that differs only in case, spacing or encoding. */
async function findBySlug(
  model: { findUnique: (a: { where: { slug: string }; select: { id: true } }) => Promise<{ id: number } | null>; findMany: (a: { select: { id: true; slug: true } }) => Promise<{ id: number; slug: string }[]> },
  slug: string
) {
  const exact = await model.findUnique({ where: { slug }, select: { id: true } });
  if (exact) return exact;
  const key = slugKey(slug);
  if (!key) return null;
  return (await model.findMany({ select: { id: true, slug: true } })).find((r) => slugKey(r.slug) === key) ?? null;
}

const finders: Record<string, (slug: string) => Promise<{ id: number } | null>> = {
  product: (slug) => findBySlug(prisma.product, slug),
  accessory: (slug) => findBySlug(prisma.accessory, slug),
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
  const item = await find(decodeSlugParam(slug));
  redirect(item ? `${editPaths[kind]}/${item.id}/edit` : editPaths[kind]);
}
