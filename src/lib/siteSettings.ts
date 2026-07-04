import { prisma } from "@/lib/prisma";

export type SiteSettings = {
  phone: string;
  phoneDisplay: string;
  email: string;
  lineId: string;
  lineUrl: string;
  facebookUrl: string;
  mapEmbedUrl: string;
  statsClients: string;
  statsYears: string;
  statsSupport: string;
};

const defaults: SiteSettings = {
  phone: "",
  phoneDisplay: "",
  email: "",
  lineId: "",
  lineUrl: "",
  facebookUrl: "",
  mapEmbedUrl: "",
  statsClients: "",
  statsYears: "",
  statsSupport: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await prisma.siteSetting.findMany();
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return { ...defaults, ...map } as SiteSettings;
}

export async function getSiteImages(): Promise<Record<string, string | undefined>> {
  const rows = await prisma.siteImage.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.url ?? undefined]));
}

export async function getTrustLogos() {
  return prisma.trustLogo.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getOfficialPartners() {
  return prisma.officialPartner.findMany({ orderBy: { sortOrder: "asc" } });
}
