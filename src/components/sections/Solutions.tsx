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
    <section id="solutions" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-2">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">{t("title")}</h2>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {solutionCards.map((card, index) => (
          <FadeIn key={card.key} delay={index * 0.08} className={card.featured ? "lg:row-span-2" : ""}>
            <Link
              href={card.href}
              className={`group block h-full rounded-2xl border border-border p-6 transition-all hover:-translate-y-1 hover:shadow-md ${
                card.featured ? "lg:p-8" : ""
              }`}
            >
              <PlaceholderImage
                ratio={card.featured ? "16/9" : "4/3"}
                label={`${t(`items.${card.key}.title`)} photo`}
                src={images[card.imageKey]}
              />
              <h3 className="mt-5 text-xl font-semibold">
                {t(`items.${card.key}.title`)}
              </h3>
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
