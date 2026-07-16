import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getOfficialPartners } from "@/lib/siteSettings";
import { FadeIn } from "@/components/ui/FadeIn";

function PartnerTile({ partner }: { partner: { id: number; name: string; imageUrl: string | null } }) {
  return partner.imageUrl ? (
    <div className="relative flex h-16 items-center justify-center rounded-lg bg-surface-1 px-3">
      <Image
        src={partner.imageUrl}
        alt={partner.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-contain p-3"
      />
    </div>
  ) : (
    <div className="flex h-16 items-center justify-center rounded-lg bg-surface-1 px-3 text-center text-sm font-medium text-text-2">
      {partner.name}
    </div>
  );
}

export async function OfficialPartners() {
  const t = await getTranslations("about.partners");
  const partners = await getOfficialPartners();

  if (partners.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
        {partners.map((partner, index) => {
          const tile = <PartnerTile partner={partner} />;
          return (
            <FadeIn key={partner.id} delay={index * 0.06}>
              {partner.websiteUrl ? (
                <a
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block transition-transform hover:-translate-y-0.5"
                >
                  {tile}
                </a>
              ) : (
                tile
              )}
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
