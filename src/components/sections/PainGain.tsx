import { FadeIn } from "@/components/ui/FadeIn";

export type PainGainItem = { pain: string; gain: string };

export function PainGain({
  id,
  title,
  painLabel,
  gainLabel,
  items,
}: {
  id?: string;
  title: string;
  painLabel: string;
  gainLabel: string;
  items: PainGainItem[];
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-2 divide-x divide-border bg-surface-0 text-sm font-semibold">
          <p className="px-4 py-3 sm:px-6">{painLabel}</p>
          <p className="px-4 py-3 sm:px-6 text-primary-600">{gainLabel}</p>
        </div>
        <div className="divide-y divide-border">
          {items.map((item, index) => (
            <div key={item.pain} className="grid grid-cols-2 divide-x divide-border">
              <FadeIn x={-16} y={0} delay={index * 0.08} className="px-4 py-4 sm:px-6">
                <p className="text-sm text-text-2">{item.pain}</p>
              </FadeIn>
              <FadeIn x={16} y={0} delay={index * 0.08 + 0.05} className="px-4 py-4 sm:px-6">
                <p className="text-sm font-medium text-text-1">{item.gain}</p>
              </FadeIn>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
