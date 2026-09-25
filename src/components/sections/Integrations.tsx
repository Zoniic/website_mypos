import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";

type IntegrationGroup = { label: string; items: string[] };

export async function Integrations() {
  const t = await getTranslations("integrations");
  const groups = (t.raw("groups") as IntegrationGroup[]) ?? [];

  if (!groups.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader title={t("title")} lede={t("lede")} />

      <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {groups.map((group, index) => (
          <FadeIn key={group.label} delay={index * 0.06} className="border-t-2 border-text-1 pt-5">
            <h3 className="font-display text-lg font-semibold">{group.label}</h3>
            <ul className="mt-3 divide-y divide-border">
              {group.items.map((item) => (
                <li key={item} className="py-2.5 text-text-1">
                  {item}
                </li>
              ))}
            </ul>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
