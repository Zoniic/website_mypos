import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { FadeIn } from "@/components/ui/FadeIn";
import { getSiteImages } from "@/lib/siteSettings";

export async function About() {
  const t = await getTranslations("home.about");
  const images = await getSiteImages();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <FadeIn x={-24} y={0}>
          <PlaceholderImage ratio="4/3" label="Team / factory photo" src={images["about-team"]} />
        </FadeIn>
        <FadeIn x={24} y={0} delay={0.1}>
          <p className="text-sm font-semibold uppercase tracking-wide text-text-2">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-text-2">{t("description")}</p>
          <Link
            href="/about"
            className="mt-6 inline-block text-sm font-semibold underline underline-offset-4 transition-transform hover:translate-x-1"
          >
            {t("cta")} →
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
