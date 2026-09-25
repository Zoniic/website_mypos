import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/ui/FadeIn";

type Benefit = { title: string; description: string; featured?: boolean };

export async function SelfServiceBenefits() {
  const t = await getTranslations("selfService");
  const items = (t.raw("items") as Benefit[]) ?? [];
  const languages = (t.raw("languages") as string[]) ?? [];

  if (!items.length) return null;

  const ordered = [...items.filter((i) => i.featured), ...items.filter((i) => !i.featured)];

  return (
    <section className="border-y border-border bg-surface-0">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-12 lg:gap-10 lg:px-8">
        <FadeIn className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-text-2">{t("lede")}</p>

            {languages.length > 0 && (
              <div className="mt-10 border-t border-border-strong pt-6">
                <p className="font-display text-lg font-semibold">{t("languagesTitle")}</p>
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-text-2">{t("languagesDesc")}</p>
                <p className="mt-4 max-w-md text-sm leading-7 text-text-1" lang="mul">
                  {languages.join("  ·  ")}
                </p>
              </div>
            )}
          </div>
        </FadeIn>

        <ul className="divide-y divide-border-strong border-y border-border-strong lg:col-span-7">
          {ordered.map((item, index) => (
            <li key={item.title}>
              <FadeIn delay={index * 0.05} className="grid gap-2 py-7 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-8">
                <h3
                  className={`font-display text-xl font-semibold leading-snug ${
                    item.featured ? "text-primary-600" : ""
                  }`}
                >
                  {item.title}
                </h3>
                <p className="leading-relaxed text-text-2">{item.description}</p>
              </FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
