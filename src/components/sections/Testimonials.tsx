import { Quote } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";

type Testimonial = {
  quote: string;
  name: string;
  business: string;
};

/**
 * Customer testimonials. Renders nothing until the team adds entries via
 * Admin → Content → testimonials, so the homepage never shows an empty block.
 */
export async function Testimonials() {
  const t = await getTranslations("testimonials");
  const items = (t.raw("items") as Testimonial[]) ?? [];

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader title={t("title")} />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <FadeIn key={`${item.name}-${index}`} delay={(index % 3) * 0.08}>
            <figure className="flex h-full flex-col rounded-3xl border border-border bg-surface-1 p-8">
              <Quote size={32} strokeWidth={1.75} aria-hidden="true" className="text-primary-600/40" />
              <blockquote className="mt-4 flex-1 text-text-1">{item.quote}</blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <span className="block font-semibold">{item.name}</span>
                <span className="text-sm text-text-2">{item.business}</span>
              </figcaption>
            </figure>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
