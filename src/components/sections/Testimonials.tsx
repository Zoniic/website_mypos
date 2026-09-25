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
              <svg viewBox="0 0 24 24" aria-hidden className="h-8 w-8 text-primary-600/40">
                <path
                  fill="currentColor"
                  d="M9.5 8H6a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3H5v2h5v-6.5A3.5 3.5 0 0 0 9.5 8Zm10 0H16a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3h-3v2h5v-6.5A3.5 3.5 0 0 0 19.5 8Z"
                />
              </svg>
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
