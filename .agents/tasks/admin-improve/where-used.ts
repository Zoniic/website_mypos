// Read-only: where do the image slots and the orphan-flagged files appear in the database?
// Run: node node_modules/tsx/dist/cli.mjs .agents/tasks/admin-improve/where-used.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const NEEDLES = ["about-team", "software-hero", "software-screenshot", "hero-background", "pager-20"];

async function main() {
  const images = await prisma.siteImage.findMany({ orderBy: { key: "asc" } });
  console.log("SiteImage rows:");
  for (const i of images) console.log(`  ${i.key} = ${i.url ? i.url.split("/uploads/").pop() : "(empty)"}`);
  const settings = await prisma.siteSetting.findMany();
  for (const n of NEEDLES) {
    const s = settings.filter((r) => r.value.includes(n)).map((r) => r.key);
    const pc = await prisma.pageContent.findMany({ where: { value: { contains: n } }, select: { namespace: true, key: true, locale: true } });
    console.log(`${n}: settings=[${s.join(",")}] pageContent=${pc.length} ${pc.slice(0, 3).map((p) => `${p.namespace}.${p.key}.${p.locale}`).join(" ")}`);
  }
  const heroSetting = settings.filter((r) => /hero/i.test(r.key)).map((r) => `${r.key}=${r.value.split("/uploads/").pop()}`);
  console.log(`hero settings: ${heroSetting.join(" | ") || "(none)"}`);
}

main()
  .catch((e) => {
    console.error("ERROR", e instanceof Error ? e.message.slice(0, 300) : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
