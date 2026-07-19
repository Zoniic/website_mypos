import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { FadeIn } from "@/components/ui/FadeIn";
import { getSiteImages } from "@/lib/siteSettings";

export async function About() {
  const t = await getTranslations("home.about");
  const images = await getSiteImages();

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
        {/* Text leads on the left, taking a narrow editorial column. */}
        <FadeIn x={-24} y={0} className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
              {t("eyebrow")}
            </span>
            <span aria-hidden className="h-px w-10 bg-border-strong" />
          </div>
          <h2 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-text-2">
            {t("description")}
          </p>
          <Link
            href="/about"
            className="group mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 underline-offset-4 hover:underline"
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

        {/* Image takes the dominant right column, breaking the old 50/50. */}
        <FadeIn
          x={24}
          y={0}
          delay={0.1}
          className="group overflow-hidden rounded-3xl shadow-lg lg:col-span-7"
        >
          <PlaceholderImage
            ratio="16/10"
            label="Team / factory photo"
            src={images["about-team"]}
            className="transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </FadeIn>
      </div>
    </section>
  );
}
