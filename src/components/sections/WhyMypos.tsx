import { useTranslations } from "next-intl";

const whyItems = ["manufacture", "support", "software"] as const;

const stats = [
  { key: "clients", value: "500+" },
  { key: "years", value: "10+" },
  { key: "support", value: "24/7" },
] as const;

export function WhyMypos() {
  const t = useTranslations("home.why");

  return (
    <section className="border-y border-border bg-surface-0 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-text-2">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            {t("title")}
          </h2>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {whyItems.map((key) => (
            <div key={key} className="rounded-2xl bg-surface-1 p-6 shadow-sm">
              <h3 className="text-lg font-semibold">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-text-2">
                {t(`items.${key}.description`)}
              </p>
            </div>
          ))}
        </div>

        <dl className="mt-12 grid grid-cols-3 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.key}>
              <dd className="text-3xl font-bold">{stat.value}</dd>
              <dt className="mt-1 text-sm text-text-2">
                {t(`stats.${stat.key}`)}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
