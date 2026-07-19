import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Benefit = { title: string; description: string; featured?: boolean };

export async function SelfServiceBenefits() {
  const t = await getTranslations("selfService");
  const items = (t.raw("items") as Benefit[]) ?? [];
  const languages = (t.raw("languages") as string[]) ?? [];

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

      <div className="mt-14 grid gap-4 lg:grid-cols-3">
        {/* 10-language highlight — a differentiator competitors rarely show. */}
        <FadeIn className="lg:col-span-3">
          <div className="flex flex-col gap-6 rounded-3xl bg-text-1 p-8 text-white sm:flex-row sm:items-center sm:p-10">
            <div className="sm:max-w-sm">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold leading-none">10</span>
                <span className="text-lg font-semibold text-white/80">
                  {t("languagesTitle").replace(/10\s*/, "")}
                </span>
              </div>
              <p className="mt-4 text-white/80">{t("languagesDesc")}</p>
            </div>
            {languages.length ? (
              <ul className="flex flex-1 flex-wrap gap-2 sm:justify-end" aria-label={t("languagesTitle")}>
                {languages.map((lang) => (
                  <li
                    key={lang}
                    className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-sm font-medium text-white"
                  >
                    {lang}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </FadeIn>

        {items.map((item, index) => (
          <FadeIn key={item.title} delay={index * 0.06} className={item.featured ? "lg:col-span-3" : ""}>
            <div
              className={`flex h-full gap-4 rounded-3xl border p-8 ${
                item.featured
                  ? "border-primary-400/40 bg-primary-50 shadow-[var(--shadow-glow-primary)]"
                  : "border-border bg-surface-1"
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  item.featured
                    ? "bg-[image:var(--gradient-primary)] text-white"
                    : "bg-primary-50 text-primary-600"
                }`}
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                  <path
                    d="M4 10.5l3.5 3.5L16 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-text-2">{item.description}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
