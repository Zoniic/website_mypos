import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getTrustLogos } from "@/lib/siteSettings";

export async function TrustLogos() {
  const t = await getTranslations("home.trust");
  const logos = await getTrustLogos();

  return (
    <section className="border-y border-border bg-surface-0 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-text-2">
          {t("title")}
        </p>
        <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-6">
          {logos.map((logo) =>
            logo.imageUrl ? (
              <div
                key={logo.id}
                className="relative flex h-12 items-center justify-center rounded-md bg-surface-2 px-2"
              >
                <Image
                  src={logo.imageUrl}
                  alt={logo.name}
                  fill
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <div
                key={logo.id}
                className="flex h-12 items-center justify-center rounded-md bg-surface-2 px-2 text-center text-xs font-medium text-text-2"
              >
                {logo.name}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
