import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { FadeIn } from "@/components/ui/FadeIn";
import { getSiteImages } from "@/lib/siteSettings";

export async function Hero() {
  const t = await getTranslations("home.hero");
  const images = await getSiteImages();

  return (
    <section className="relative overflow-hidden">
      {/* Ambient orange glow blobs — decorative, aria-hidden. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="animate-blob-a absolute -left-24 -top-24 h-[26rem] w-[26rem] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary-500), transparent 70%)" }}
        />
        <div
          className="animate-blob-b absolute -right-32 top-1/3 h-[22rem] w-[22rem] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-accent-500), transparent 70%)" }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28 lg:px-8">
        <FadeIn>
          <p className="ticket-tag text-primary-300">{t("eyebrow")}</p>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-2">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-4">
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

        <FadeIn delay={0.15} className="relative">
          <div className="relative rounded-hero-asset shadow-card">
            <PlaceholderImage ratio="4/3" label="Hero product photo" src={images.hero} />
          </div>

          {/* Floating POS status card — decorative motif, no fabricated stats. */}
          <div
            aria-hidden
            className="animate-float-y absolute -bottom-6 -left-6 hidden items-center gap-3 rounded-card border border-border bg-surface-1/90 px-4 py-3 shadow-card backdrop-blur sm:flex"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-primary)] text-text-1 shadow-[var(--shadow-glow-primary)]">
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                <path
                  d="M5 10.5 8.5 14 15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="barcode-bars text-text-2" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
