import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";

export type RecommendedSolution = { slug: string; label: string; blurb: string };

export function RecommendedSolutions({
  id,
  eyebrow,
  title,
  lede,
  viewLabel,
  items,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  lede: string;
  viewLabel: string;
  items: RecommendedSolution[];
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeader eyebrow={eyebrow} title={title} lede={lede} />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <FadeIn key={item.slug} delay={index * 0.06}>
            <Link
              href={`/solutions/${item.slug}`}
              className="group flex h-full flex-col rounded-card border border-border bg-surface-1/40 p-6 outline-offset-2 transition-all hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
            >
              <span className="text-xs font-semibold tabular-nums text-primary-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-lg font-semibold">{item.label}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-text-2">{item.blurb}</p>
              <span className="mt-4 text-sm font-semibold text-primary-600 underline-offset-4 group-hover:underline">
                {viewLabel} →
              </span>
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
