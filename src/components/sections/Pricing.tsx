import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

type PricingItem = {
  name: string;
  audience: string;
  price: string;
  priceNote: string;
  features: string[];
  featured: boolean;
};

/** Packages as one ruled comparison sheet rather than three floating cards. */
export async function Pricing() {
  const t = await getTranslations("pricing");
  const items = t.raw("items") as PricingItem[];

  if (!items?.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader title={t("title")} lede={t("lede")} />

      <FadeIn className="mt-12">
        <div className="grid border-y-2 border-text-1 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.name}
              className={`flex flex-col px-6 py-8 sm:px-8 ${
                index > 0 ? "border-t border-border-strong lg:border-l lg:border-t-0" : ""
              } ${item.featured ? "bg-primary-50" : ""}`}
            >
              <p className={`h-5 text-sm font-semibold ${item.featured ? "text-primary-600" : "text-transparent"}`}>
                {item.featured ? t("recommended") : ""}
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold">{item.name}</h3>
              <p className="mt-1 text-sm text-text-2">{item.audience}</p>

              <p className="mt-6 flex items-baseline gap-2">
                {item.price ? (
                  <>
                    <span className="text-sm text-text-2">{t("priceFrom")}</span>
                    <span className="font-display text-4xl font-semibold tabular-nums tracking-tight">
                      ฿{item.price}
                    </span>
                  </>
                ) : (
                  <span className="font-display text-3xl font-semibold tracking-tight">{item.priceNote}</span>
                )}
              </p>

              <ul className="mt-6 flex-1 space-y-2.5 border-t border-border-strong pt-5">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-text-1">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-primary-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  href="/contact?topic=quote"
                  variant={item.featured ? "primary" : "ghost"}
                  className="w-full justify-center"
                >
                  {t("ctaLabel")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      <p className="mt-6 text-sm text-text-2">{t("note")}</p>
    </section>
  );
}
