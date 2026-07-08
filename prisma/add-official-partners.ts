/**
 * One-off, idempotent seed for known Official Partners (name only — no
 * logo yet, so the public page falls back to showing the name as text
 * until someone uploads a logo via Admin -> Official Partners).
 *
 * For any partner added after this, just use the Admin -> Official
 * Partners -> New form directly; there's no need to touch this script.
 *
 * Run: npx tsx prisma/add-official-partners.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const partners = ["Beam", "P5 Management"];

async function main() {
  const existing = await prisma.officialPartner.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((p) => p.name));
  const count = await prisma.officialPartner.count();

  let sortOrder = count;
  for (const name of partners) {
    if (existingNames.has(name)) {
      console.log(`Skipped (already exists): ${name}`);
      continue;
    }
    await prisma.officialPartner.create({ data: { name, sortOrder } });
    console.log(`Added: ${name}`);
    sortOrder += 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
