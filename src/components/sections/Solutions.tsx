import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { FadeIn } from "@/components/ui/FadeIn";
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
    <section id="solutions" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {solutionCards.map((card, index) => (
          <FadeIn key={card.key} delay={index * 0.08} className={card.featured ? "lg:row-span-2" : ""}>
            <Link
              href={card.href}
              className={`group block h-full rounded-card border border-border bg-surface-1/40 p-6 transition-all hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)] ${
                card.featured ? "lg:p-8" : ""
              }`}
            >
              <div className="overflow-hidden rounded-lg">
                <PlaceholderImage
                  ratio={card.featured ? "16/9" : "4/3"}
                  label={`${t(`items.${card.key}.title`)} photo`}
                  src={images[card.imageKey]}
                  className="transition-transform duration-500 ease-out group-hover:scale-105"
                />
              </div>
              <div className="mt-5 flex items-center justify-between gap-2">
                <h3 className="text-xl font-semibold">
                  {t(`items.${card.key}.title`)}
                </h3>
                <svg
                  aria-hidden
                  viewBox="0 0 20 20"
                  fill="none"
                  className="h-5 w-5 shrink-0 text-primary-300 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                >
                  <path
                    d="M4 10h12m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="mt-2 text-text-2">
                {t(`items.${card.key}.description`)}
              </p>
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
