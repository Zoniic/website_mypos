import { getTranslations } from "next-intl/server";
import { getSiteSettings } from "@/lib/siteSettings";
import { FadeIn } from "@/components/ui/FadeIn";
import { CountUp } from "@/components/ui/CountUp";
import { SectionHeader } from "@/components/ui/SectionHeader";

const whyItems = ["manufacture", "support", "software"] as const;

const whyIcons: Record<(typeof whyItems)[number], string> = {
  manufacture: "M4 16V8l6-4 6 4v8M4 16h12M4 16v2h12v-2M9 16v-4h2v4",
  support: "M10 2a6 6 0 0 0-6 6v3a2 2 0 0 0 2 2h1v-5H5v-.5a5 5 0 0 1 10 0v.5h-2v5h1a2 2 0 0 0 2-2v-3a6 6 0 0 0-6-6Zm-3 13a3 3 0 0 0 3 3h1v-2H10a1 1 0 0 1-1-1H7Z",
  software: "M5 4h10a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm2 12h6M8 8l2 2-2 2m4 0h1",
};

export async function WhyMypos() {
  const t = await getTranslations("home.why");
  const settings = await getSiteSettings();

  const stats = [
    { key: "clients", value: settings.statsClients },
    { key: "years", value: settings.statsYears },
    { key: "support", value: settings.statsSupport },
  ] as const;

  return (
    <section className="border-y border-border bg-surface-0 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow={t("eyebrow")} title={t("title")} />

        {/* Oversized stat band — the numbers are the hero, not a footnote. */}
        <dl className="mt-16 grid grid-cols-1 gap-y-10 border-y border-border sm:grid-cols-3 sm:divide-x sm:divide-border">
          {stats.map((stat, index) => (
            <FadeIn key={stat.key} delay={index * 0.1}>
              <div className="py-8 sm:px-8 sm:first:pl-0 sm:last:pr-0">
                <dd className="font-display text-6xl font-bold leading-none tracking-tight text-text-1 lg:text-7xl">
                  <CountUp value={stat.value} />
                </dd>
                <dt className="mt-4 text-sm font-medium uppercase tracking-widest text-text-2">
                  {t(`stats.${stat.key}`)}
                </dt>
              </div>
            </FadeIn>
          ))}
        </dl>

        {/* Borderless feature row — hairline dividers instead of boxed cards. */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl bg-border sm:grid-cols-3">
          {whyItems.map((key, index) => (
            <FadeIn key={key} delay={index * 0.1}>
              <div className="flex h-full flex-col bg-surface-0 p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-glow-primary)]">
                  <svg aria-hidden viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                    <path
                      d={whyIcons[key]}
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <h3 className="mt-6 text-xl font-semibold">
                  {t(`items.${key}.title`)}
                </h3>
                <p className="mt-3 text-text-2">{t(`items.${key}.description`)}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
