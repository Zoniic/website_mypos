import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";

type IntegrationGroup = { label: string; items: string[] };

export async function Integrations() {
  const t = await getTranslations("integrations");
  const groups = (t.raw("groups") as IntegrationGroup[]) ?? [];

  if (!groups.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

      <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-3">
        {groups.map((group, index) => (
          <FadeIn key={group.label} delay={index * 0.08}>
            <div className="flex h-full flex-col bg-surface-1 p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-text-2">
                {group.label}
              </h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-border bg-surface-0 px-3.5 py-1.5 text-sm font-medium text-text-1"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
