import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BusinessTypeIcon } from "@/components/ui/BusinessTypeIcon";
import { isIndustrySlug } from "@/data/industries";

type UseCaseItem = { type: string; title: string; blurb: string };

/** A directory of business types — a ruled index, not a grid of cards. */
export async function UseCases() {
  const t = await getTranslations("useCases");
  const items = (t.raw("items") as UseCaseItem[]) ?? [];

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader title={t("title")} lede={t("lede")} />

      <ul className="mt-12 grid border-t border-border-strong lg:grid-cols-2 lg:gap-x-12">
        {items.map((item, index) => (
          <li key={item.type} className="border-b border-border-strong">
            <FadeIn delay={(index % 2) * 0.04}>
              <Link
                href={
                  isIndustrySlug(item.type)
                    ? `/industries/${item.type}`
                    : { pathname: "/products", query: { businessType: item.type } }
                }
                className="group -mx-3 flex items-center gap-5 rounded-lg px-3 py-5 outline-offset-2 transition-colors hover:bg-surface-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              >
                <span className="text-text-2 transition-colors group-hover:text-primary-600">
                  <BusinessTypeIcon type={item.type} size={22} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-xl font-semibold">{item.title}</span>
                  <span className="mt-0.5 block text-sm text-text-2">{item.blurb}</span>
                </span>
                <span
                  aria-hidden
                  className="text-lg text-text-3 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary-600"
                >
                  →
                </span>
              </Link>
            </FadeIn>
          </li>
        ))}
      </ul>
    </section>
  );
}
