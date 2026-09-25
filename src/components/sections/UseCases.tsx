import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BusinessTypeIcon } from "@/components/ui/BusinessTypeIcon";
import { isIndustrySlug } from "@/data/industries";

type UseCaseItem = { type: string; title: string; blurb: string };

export async function UseCases() {
  const t = await getTranslations("useCases");
  const items = (t.raw("items") as UseCaseItem[]) ?? [];

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <FadeIn key={item.type} delay={(index % 3) * 0.06}>
            <Link
              href={
                isIndustrySlug(item.type)
                  ? `/industries/${item.type}`
                  : { pathname: "/products", query: { businessType: item.type } }
              }
              className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-surface-1 p-6 outline-offset-2 transition-all hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <BusinessTypeIcon type={item.type} />
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm text-text-2">{item.blurb}</p>
              </div>
              <span
                aria-hidden
                className="mt-0.5 shrink-0 text-primary-600 transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
