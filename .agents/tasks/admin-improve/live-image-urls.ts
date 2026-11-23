// Read-only: prints every Supabase upload URL the database references (site images, products,
// accessories, references, logos, partners, KB, blog, hero video), one per line.
// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/live-image-urls.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const texts: (string | null | undefined)[] = [];
  for (const r of await prisma.siteImage.findMany()) texts.push(r.url);
  for (const r of await prisma.siteSetting.findMany()) texts.push(r.value);
  for (const r of await prisma.product.findMany()) texts.push(r.imageUrl, r.galleryUrls);
  for (const r of await prisma.accessory.findMany()) texts.push(r.imageUrl);
  for (const r of await prisma.referenceCase.findMany()) texts.push(r.imageUrl, r.logoUrl);
  for (const r of await prisma.trustLogo.findMany()) texts.push(r.imageUrl);
  for (const r of await prisma.officialPartner.findMany()) texts.push(r.imageUrl);
  for (const r of await prisma.kbArticle.findMany()) texts.push(r.coverImageUrl, r.pdfUrl);
  for (const r of await prisma.blogPost.findMany()) texts.push(r.coverImageUrl);
  const urls = new Set<string>();
  for (const t of texts) for (const m of (t ?? "").matchAll(/https:\/\/[^\s",]+\/storage\/v1\/object\/public\/[^\s",]+/g)) urls.add(m[0]);
  for (const u of urls) console.log(u);
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message.slice(0, 300) : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
