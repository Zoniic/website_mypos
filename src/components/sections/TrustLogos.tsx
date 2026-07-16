import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getTrustLogos } from "@/lib/siteSettings";

function LogoTile({ logo }: { logo: { id: number; name: string; imageUrl: string | null } }) {
  return logo.imageUrl ? (
    <div className="relative flex h-12 w-32 shrink-0 items-center justify-center rounded-md bg-surface-2 px-2">
      <Image src={logo.imageUrl} alt={logo.name} fill sizes="128px" className="object-contain p-2" />
    </div>
  ) : (
    <div className="flex h-12 w-32 shrink-0 items-center justify-center rounded-md bg-surface-2 px-2 text-center text-xs font-medium text-text-2">
      {logo.name}
    </div>
  );
}

export async function TrustLogos() {
  const t = await getTranslations("home.trust");
  const logos = await getTrustLogos();

  if (logos.length === 0) return null;

  // Duplicate the strip so the CSS marquee can loop seamlessly at -50%.
  const track = [...logos, ...logos];

  return (
    <section className="border-b border-border bg-bg py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-text-2">
          {t("title")}
        </p>
        <div className="group mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="flex w-max animate-marquee gap-6 group-hover:[animation-play-state:paused]">
            {track.map((logo, index) => (
              <LogoTile key={`${logo.id}-${index}`} logo={logo} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
