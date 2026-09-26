import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";

export type FeatureItem = { title: string; description: string };
export type SpecRow = { label: string; value: string };

/**
 * "What it does" + "Specifications" for a product line. Features are a
 * ruled two-column list (not a card grid); specs are a plain definition
 * table, because buyers compare them line by line.
 */
export function SolutionDetails({
  id,
  featuresTitle,
  features,
  specsTitle,
  specs,
}: {
  id?: string;
  featuresTitle: string;
  features: FeatureItem[];
  specsTitle: string;
  specs: SpecRow[];
}) {
  if (!features.length && !specs.length) return null;

  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      {features.length > 0 && (
        <>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{featuresTitle}</h2>
          <ul className="mt-10 grid gap-x-12 border-t border-border sm:grid-cols-2">
            {features.map((feature, index) => (
              <li key={feature.title} className="border-b border-border py-6">
                <FadeIn delay={(index % 2) * 0.05}>
                  <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-text-2">{feature.description}</p>
                </FadeIn>
              </li>
            ))}
          </ul>
        </>
      )}

      {specs.length > 0 && (
        <div className={features.length ? "mt-20" : ""}>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{specsTitle}</h2>
          <dl className="mt-8 divide-y divide-border border-y-2 border-text-1">
            {specs.map((row) => (
              <div key={row.label} className="grid gap-1 py-4 sm:grid-cols-[240px_1fr] sm:gap-8">
                <dt className="text-sm font-semibold text-text-1">{row.label}</dt>
                <dd className="whitespace-pre-line text-sm leading-relaxed text-text-2">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}

/** Ink band: every online product line is managed from the MYPOS back office. */
export function BackOfficeBand({ title, body, cta }: { title: string; body: string; cta: string }) {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
          <p className="mt-3 leading-relaxed text-white/75">{body}</p>
        </div>
        <Link
          href="/software"
          className="inline-flex shrink-0 items-center rounded-button border border-white/30 px-5 py-3 font-semibold text-white outline-offset-2 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          {cta} →
        </Link>
      </div>
    </section>
  );
}
