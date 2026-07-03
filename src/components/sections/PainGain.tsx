export type PainGainItem = { pain: string; gain: string };

export function PainGain({
  title,
  painLabel,
  gainLabel,
  items,
}: {
  title: string;
  painLabel: string;
  gainLabel: string;
  items: PainGainItem[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-2 divide-x divide-border bg-surface-0 text-sm font-semibold">
          <p className="px-4 py-3 sm:px-6">{painLabel}</p>
          <p className="px-4 py-3 sm:px-6">{gainLabel}</p>
        </div>
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.pain} className="grid grid-cols-2 divide-x divide-border">
              <p className="px-4 py-4 text-sm text-text-2 sm:px-6">{item.pain}</p>
              <p className="px-4 py-4 text-sm font-medium text-text-1 sm:px-6">
                {item.gain}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
