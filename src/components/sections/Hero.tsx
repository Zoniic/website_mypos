import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { ShinyText } from "@/components/ui/ShinyText";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { getSiteImages, getSiteSettings } from "@/lib/siteSettings";

export async function Hero() {
  const t = await getTranslations("home.hero");
  const settings = await getSiteSettings();
  const images = await getSiteImages();

  return (
    <section className="relative flex h-screen min-h-[720px] flex-col overflow-hidden bg-bg">
      {/* Background: an admin-uploaded product video if set, else the
          admin-uploaded hero photo dimmed behind the gradient, else just
          the animated orange glow — never a stock/unrelated clip. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {settings.heroVideoUrl ? (
          <HeroVideoBackground src={settings.heroVideoUrl} />
        ) : (
          images.hero && (
            <Image src={images.hero} alt="" fill priority className="object-cover opacity-40" />
          )
        )}
        <div
          className="animate-blob-a absolute -left-24 -top-24 h-[32rem] w-[32rem] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary-500), transparent 70%)" }}
        />
        <div
          className="animate-blob-b absolute -right-32 top-1/3 h-[26rem] w-[26rem] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent-500), transparent 70%)" }}
        />
        {/* Readability vignette: solid where the headline/CTAs sit, fully
            transparent toward the edges — so the video/photo actually reads
            as an image instead of being smothered under a flat wash. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 62% 58% at 50% 52%, var(--color-bg) 0%, var(--color-bg) 32%, transparent 78%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-bg/30" />
      </div>

      {/* Centered glow behind the headline — brand orange, kept subtle so it
          reads as ambient light rather than washing out the text above it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[110px]"
        style={{ background: "var(--color-primary-600)" }}
      />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 lg:px-8">
        {/* Center hero content. */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-tight text-text-1/80 sm:text-sm">
              {t("tagline")}
            </p>
            <h1 className="mt-4 font-display text-5xl font-medium leading-[1.05] tracking-tighter text-text-1 sm:text-7xl sm:leading-[0.95] xl:text-9xl xl:leading-[0.85]">
              <span className="block">{t("headlineLine1")}</span>
              <ShinyText className="block" speed={3} angle={100}>
                {t("headlineLine2")}
              </ShinyText>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-text-2 opacity-90 sm:text-lg">
              {t("subtitle")}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact" variant="primary" size="lg" className="group rounded-full px-6 py-3 md:px-8 md:py-4">
                {t("ctaPrimary")}
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                >
                  <path
                    d="M4 10h12m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              <Button href="#solutions" variant="ghost" size="lg" className="rounded-full">
                {t("ctaSecondary")}
              </Button>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
