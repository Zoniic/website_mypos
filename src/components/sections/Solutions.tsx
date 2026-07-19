import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getSiteImages } from "@/lib/siteSettings";

const solutionCards = [
  { key: "selfOrder", imageKey: "solution-self-order", href: "/solutions/self-order", featured: true },
  { key: "weighPay", imageKey: "solution-weigh-pay", href: "/solutions/weigh-pay", featured: false },
  { key: "pos", imageKey: "solution-pos", href: "/solutions/pos", featured: false },
  { key: "ticketing", imageKey: "solution-ticketing", href: "/solutions/ticketing", featured: false },
] as const;

export async function Solutions() {
  const t = await getTranslations("home.solutions");
  const images = await getSiteImages();

  return (
    <section
      id="solutions"
      className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8"
    >
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

      {/*
        Asymmetric editorial grid: the featured solution is a full-bleed image
        panel spanning the top; the other three sit below as borderless tinted
        tiles with a running index. No more four identical hairline cards.
      */}
      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        <FadeIn className="lg:col-span-3">
          <Link
            href={solutionCards[0].href}
            className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl bg-surface-2 sm:min-h-[30rem]"
          >
            <PlaceholderImage
              ratio="21/9"
              label={`${t(`items.${solutionCards[0].key}.title`)} photo`}
              src={images[solutionCards[0].imageKey]}
              sizes="(min-width: 1024px) 1152px, 100vw"
              className="!absolute !inset-0 !h-full !w-full !rounded-3xl [&_img]:transition-transform [&_img]:duration-700 [&_img]:ease-out group-hover:[&_img]:scale-105"
            />
            <span
              aria-hidden
              className="absolute inset-0 rounded-3xl bg-gradient-to-t from-text-1/90 via-text-1/35 to-transparent"
            />
            <div className="relative flex flex-col justify-end p-8 sm:p-12">
              <span className="text-sm font-semibold uppercase tracking-wider text-white/80">
                {t("eyebrow")}
              </span>
              <h3 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
                {t(`items.${solutionCards[0].key}.title`)}
              </h3>
              <p className="mt-3 max-w-lg text-white/80">
                {t(`items.${solutionCards[0].key}.description`)}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white">
                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </Link>
        </FadeIn>

        {solutionCards.slice(1).map((card, index) => (
          <FadeIn key={card.key} delay={index * 0.08}>
            <Link
              href={card.href}
              className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface-1 transition-colors hover:bg-surface-2"
            >
              <div className="overflow-hidden">
                <PlaceholderImage
                  ratio="16/10"
                  label={`${t(`items.${card.key}.title`)} photo`}
                  src={images[card.imageKey]}
                  className="transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">
                    {t(`items.${card.key}.title`)}
                  </h3>
                  <span
                    aria-hidden
                    className="text-primary-600 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  >
                    →
                  </span>
                </div>
                <p className="mt-2 text-sm text-text-2">
                  {t(`items.${card.key}.description`)}
                </p>
              </div>
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
