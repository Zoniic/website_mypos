import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/siteSettings";
import { FadeIn } from "@/components/ui/FadeIn";
import { CountUp } from "@/components/ui/CountUp";

const whyItems = ["manufacture", "support", "software"] as const;

/** The "factory floor" band: ink background, the manufacturer's case. */
export async function WhyMypos() {
  const t = await getTranslations("home.why");
  const settings = await getSiteSettings();

  // Only show numbers that have actually been entered in Site Settings — an
  // empty stat slot looks broken, and made-up ones would be worse.
  const stats = [
    { key: "clients", value: settings.statsClients },
    { key: "years", value: settings.statsYears },
    { key: "support", value: settings.statsSupport },
  ].filter((stat) => stat.value.trim() !== "");

  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        <FadeIn>
          <h2 className="max-w-3xl font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
        </FadeIn>

        {stats.length > 0 && (
          <dl className="mt-14 grid gap-8 sm:grid-cols-3">
            {stats.map((stat, index) => (
              <FadeIn key={stat.key} delay={index * 0.08} className="border-t border-white/20 pt-5">
                <dd className="font-display text-5xl font-semibold tracking-tight text-primary-400 lg:text-6xl">
                  <CountUp value={stat.value} />
                </dd>
                <dt className="mt-2 text-sm text-white/75">{t(`stats.${stat.key}`)}</dt>
              </FadeIn>
            ))}
          </dl>
        )}

        <ul className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {whyItems.map((key, index) => (
            <li key={key}>
              <FadeIn delay={index * 0.08} className="border-t border-white/20 pt-6">
                <h3 className="font-display text-xl font-semibold">{t(`items.${key}.title`)}</h3>
                <p className="mt-3 leading-relaxed text-white/75">{t(`items.${key}.description`)}</p>
              </FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
