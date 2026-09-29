import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { Magnet } from "@/components/reactbits/Magnet";
import { HeroStage } from "@/components/sections/HeroStage";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { getSiteImages, getSiteSettings } from "@/lib/siteSettings";
import { isVideoUrl } from "@/lib/heroMedia";

// Where each machine sits in the 640×360 lineup drawing, as % of the stage,
// so its label can point at it.
const callouts = [
  { key: "selfOrder", href: "/solutions/self-order", left: "16%", top: "12%" },
  { key: "queueDisplay", href: "/solutions/queue-display", left: "49%", top: "4%" },
  { key: "pos", href: "/solutions/pos", left: "40%", top: "37%" },
  { key: "kds", href: "/solutions/kds", left: "63%", top: "43%" },
  { key: "vendingOnline", href: "/solutions/vending-online", left: "86%", top: "17%" },
] as const;

export async function Hero() {
  const t = await getTranslations("home.hero");
  const tNav = await getTranslations("nav");
  const tTrust = await getTranslations("trust");
  const settings = await getSiteSettings();
  const images = await getSiteImages();
  const heroUrl = settings.heroVideoUrl;
  const heroUrlIsVideo = Boolean(heroUrl) && isVideoUrl(heroUrl);
  const heroPhoto = heroUrl && !heroUrlIsVideo ? heroUrl : images.hero;
  const trustPoints = (tTrust.raw("points") as string[]) ?? [];

  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-12 pt-10 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-8 lg:pb-16 lg:pt-14">
        <FadeIn className="lg:col-span-5">
          <p className="text-sm font-medium text-text-2">{t("tagline")}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl xl:text-[3.5rem]">
            <span className="block">{t("headlineLine1")}</span>
            <span className="block text-primary-600">{t("headlineLine2")}</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-2">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Magnet>
              <Button href="/contact?topic=demo" variant="primary" size="lg">
                {t("ctaPrimary")}
              </Button>
            </Magnet>
            <Button href="#solutions" variant="ghost" size="lg">
              {t("ctaSecondary")}
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.1} className="lg:col-span-7">
          <div data-edit-image="hero" className="stage-grid relative aspect-[16/10] overflow-hidden rounded-[28px] bg-primary-500">
            {heroUrlIsVideo ? (
              <HeroVideoBackground src={heroUrl} />
            ) : heroPhoto ? (
              <Image
                src={heroPhoto}
                alt=""
                fill
                preload
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="object-cover"
              />
            ) : (
              <HeroStage
                callouts={callouts.map((item) => ({
                  href: item.href,
                  label: tNav(`solutionsItems.${item.key}`),
                  left: item.left,
                  top: item.top,
                }))}
              />
            )}
          </div>
        </FadeIn>
      </div>

      {trustPoints.length > 0 && (
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-3 px-4 pb-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustPoints.map((point) => (
            <li key={point} className="flex items-start gap-2.5 border-t border-border-strong pt-3 text-sm font-medium text-text-1">
              <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-primary-600" />
              {point}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
