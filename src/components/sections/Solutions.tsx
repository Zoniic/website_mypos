import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

const solutionCards = [
  { key: "selfOrder", href: "/solutions/self-order", featured: true },
  { key: "weighPay", href: "/solutions/weigh-pay", featured: false },
  { key: "pos", href: "/solutions/pos", featured: false },
  { key: "ticketing", href: "/solutions/ticketing", featured: false },
] as const;

export function Solutions() {
  const t = useTranslations("home.solutions");

  return (
    <section id="solutions" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-2">
          {t("eyebrow")}
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight">{t("title")}</h2>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {solutionCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className={`group rounded-2xl border border-border p-6 transition-shadow hover:shadow-md ${
              card.featured ? "lg:row-span-2 lg:p-8" : ""
            }`}
          >
            <PlaceholderImage
              ratio={card.featured ? "16/9" : "4/3"}
              label={`${t(`items.${card.key}.title`)} photo`}
            />
            <h3 className="mt-5 text-xl font-semibold">
              {t(`items.${card.key}.title`)}
            </h3>
            <p className="mt-2 text-text-2">
              {t(`items.${card.key}.description`)}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
