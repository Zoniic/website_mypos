import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { HeroVideoBackground } from "@/components/sections/HeroVideoBackground";
import { getSiteImages, getSiteSettings } from "@/lib/siteSettings";

export async function Hero() {
  const t = await getTranslations("home.hero");
  const settings = await getSiteSettings();
  const images = await getSiteImages();

  return (
    <section className="relative flex min-h-[88vh] flex-col overflow-hidden bg-bg">
      {/* Background: an admin-uploaded product video if set, else the
          admin-uploaded hero photo dimmed behind the gradient, else just
          the animated orange glow — never a stock/unrelated clip. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden">
        {settings.heroVideoUrl ? (
          <HeroVideoBackground src={settings.heroVideoUrl} />
        ) : (
          images.hero && (
            <Image
              src={images.hero}
              alt=""
              fill
              priority
              className="object-cover opacity-[0.12]"
            />
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
        {/* Strong, mostly-opaque dark wash so text always has reliable
            contrast regardless of what's behind it (video/photo/glow). */}
        <div className="absolute inset-0 bg-bg/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/60" />
      </div>

      {/* Centered glow behind the headline — brand orange, kept subtle so it
          reads as ambient light rather than washing out the text above it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[110px]"
        style={{ background: "var(--color-primary-600)" }}
      />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
        <FadeIn>
          <span className="liquid-glass ticket-tag inline-flex rounded-tag px-4 py-1.5 text-primary-200">
            {t("eyebrow")}
          </span>
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-text-1 sm:text-6xl lg:text-7xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-text-2 opacity-90">
            {t("subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button href="/contact" variant="primary" size="lg" className="group">
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
            <Button href="#solutions" variant="ghost" size="lg">
              {t("ctaSecondary")}
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
