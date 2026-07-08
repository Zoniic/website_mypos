import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { FadeIn } from "@/components/ui/FadeIn";
import { getSiteImages } from "@/lib/siteSettings";

export async function Hero() {
  const t = await getTranslations("home.hero");
  const images = await getSiteImages();

  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24 lg:px-8">
      <FadeIn>
        <p className="eyebrow-accent text-sm font-semibold uppercase tracking-wide">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-lg text-text-2">{t("subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/contact" variant="primary" size="lg">
            {t("ctaPrimary")}
          </Button>
          <Button href="#solutions" variant="ghost" size="lg">
            {t("ctaSecondary")}
          </Button>
        </div>
      </FadeIn>
      <FadeIn delay={0.15}>
        <PlaceholderImage ratio="4/3" label="Hero product photo" src={images.hero} />
      </FadeIn>
    </section>
  );
}
