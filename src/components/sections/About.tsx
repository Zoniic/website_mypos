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
        <FadeIn x={-24} y={0} className="group overflow-hidden rounded-hero-asset shadow-card">
          <PlaceholderImage
            ratio="4/3"
            label="Team / factory photo"
            src={images["about-team"]}
            className="transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </FadeIn>
        <FadeIn x={24} y={0} delay={0.1}>
          <p className="ticket-tag text-primary-300">{t("eyebrow")}</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-text-2">{t("description")}</p>
          <Link
            href="/about"
            className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-300 underline-offset-4 hover:underline"
          >
            {t("cta")}
            <svg
              aria-hidden
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
            >
              <path
                d="M4 10h12m0 0-5-5m5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
