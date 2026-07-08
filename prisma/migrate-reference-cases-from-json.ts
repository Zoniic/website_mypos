import { PrismaClient } from "@prisma/client";
import th from "../messages/th.json";
import en from "../messages/en.json";
import zh from "../messages/zh.json";

const prisma = new PrismaClient();

type CaseItem = { business: string; businessType: string; problem: string; install: string; result: string };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function main() {
  const existing = await prisma.referenceCase.count();
  if (existing > 0) {
    console.log(`referenceCase already has ${existing} rows — skipping migration.`);
    return;
  }

  const thItems = th.references.items as CaseItem[];
  const enItems = en.references.items as CaseItem[];
  const zhItems = zh.references.items as CaseItem[];

  for (let i = 0; i < thItems.length; i++) {
    const slug = slugify(enItems[i]?.business || thItems[i].business || `case-${i}`) || `case-${i}`;
    const referenceCase = await prisma.referenceCase.create({
      data: { slug, businessType: thItems[i].businessType, sortOrder: i },
    });

    for (const [locale, items] of [
      ["th", thItems],
      ["en", enItems],
      ["zh", zhItems],
    ] as const) {
      const item = items[i];
      await prisma.referenceCaseTranslation.create({
        data: {
          caseId: referenceCase.id,
          locale,
          business: item.business,
          problem: item.problem,
          install: item.install,
          result: item.result,
        },
      });
    }
  }

  console.log(`Migrated ${thItems.length} reference cases into the database.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
