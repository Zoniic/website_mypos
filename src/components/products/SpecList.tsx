export type SpecRow = { label: string; value: string };

export function SpecList({
  title,
  highlight,
  rows,
}: {
  title: string;
  /** Optional line under the title. */
  highlight?: string;
  rows: SpecRow[];
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {highlight && <p className="mt-4 max-w-2xl text-text-2">{highlight}</p>}
      <dl className="mt-8 grid gap-x-8 sm:grid-cols-2">
        {rows.map((row, index) => (
          <div
            // Admin-typed accessory specs may repeat a label.
            key={`${index}-${row.label}`}
            className="flex justify-between gap-4 border-b border-border py-3 text-sm"
          >
            <dt className="text-text-2">{row.label}</dt>
            <dd className="text-right font-mono font-medium text-text-1">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
