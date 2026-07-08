import type { ReferenceCase as ReferenceCaseRow, ReferenceCaseTranslation } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ReferenceCase = {
  business: string;
  businessType: string;
  problem: string;
  install: string;
  result: string;
  imageUrl?: string;
  logoUrl?: string;
};

type RowWithTranslations = ReferenceCaseRow & { translations: ReferenceCaseTranslation[] };

function toReferenceCase(row: RowWithTranslations): ReferenceCase {
  const translation = row.translations[0];
  return {
    business: translation?.business ?? "",
    businessType: row.businessType,
    problem: translation?.problem ?? "",
    install: translation?.install ?? "",
    result: translation?.result ?? "",
    imageUrl: row.imageUrl ?? undefined,
    logoUrl: row.logoUrl ?? undefined,
  };
}

export async function getAllReferenceCases(locale: string): Promise<ReferenceCase[]> {
  const rows = await prisma.referenceCase.findMany({
    include: { translations: { where: { locale } } },
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(toReferenceCase);
}
