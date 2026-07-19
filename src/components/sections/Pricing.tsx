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

export async function Pricing() {
  const t = await getTranslations("pricing");
  const items = t.raw("items") as PricingItem[];

  if (!items?.length) return null;

  return (
    <section className="border-y border-border bg-surface-0 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {items.map((item, index) => (
            <FadeIn key={item.name} delay={index * 0.08}>
              <div
                className={`flex h-full flex-col rounded-3xl p-8 ${
                  item.featured
                    ? "bg-text-1 text-white shadow-[var(--shadow-xl)] ring-1 ring-text-1"
                    : "border border-border bg-surface-1"
                }`}
              >
                {item.featured ? (
                  <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[image:var(--gradient-primary)] px-3 py-1 text-xs font-semibold text-white">
                    แนะนำ
                  </span>
                ) : null}

                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p
                  className={`mt-1 text-sm ${
                    item.featured ? "text-white/70" : "text-text-2"
                  }`}
                >
                  {item.audience}
                </p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  {item.price ? (
                    <>
                      <span
                        className={`text-sm ${item.featured ? "text-white/70" : "text-text-2"}`}
                      >
                        {t("priceFrom")}
                      </span>
                      <span className="font-display text-4xl font-bold tracking-tight">
                        ฿{item.price}
                      </span>
                    </>
                  ) : (
                    <span className="font-display text-3xl font-bold tracking-tight">
                      {item.priceNote}
                    </span>
                  )}
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          item.featured ? "text-primary-400" : "text-primary-600"
                        }`}
                      >
                        <path
                          d="M4 10.5l3.5 3.5L16 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className={item.featured ? "text-white/90" : "text-text-2"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    href="/contact"
                    variant={item.featured ? "primary" : "ghost"}
                    className="w-full justify-center"
                  >
                    {t("ctaLabel")}
                  </Button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-text-2">{t("note")}</p>
      </div>
    </section>
  );
}
