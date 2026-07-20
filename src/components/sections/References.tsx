import { FadeIn } from "@/components/ui/FadeIn";

export type CaseItem = {
  business: string;
  problem: string;
  install: string;
  result: string;
};

export function References({
  id,
  title,
  note,
  problemLabel,
  installLabel,
  resultLabel,
  cases,
}: {
  id?: string;
  title: string;
  note: string;
  problemLabel: string;
  installLabel: string;
  resultLabel: string;
  cases: CaseItem[];
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-28 px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-text-2">{note}</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {cases.map((item, index) => (
          <FadeIn key={item.business} delay={index * 0.08}>
            <div className="h-full rounded-2xl border border-border p-6 transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]">
              <h3 className="text-lg font-semibold">{item.business}</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-text-2">{problemLabel}</dt>
                  <dd className="mt-1 text-text-2">{item.problem}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-2">{installLabel}</dt>
                  <dd className="mt-1 text-text-2">{item.install}</dd>
                </div>
                <div>
                  <dt className="font-medium text-text-2">{resultLabel}</dt>
                  <dd className="mt-1 font-semibold text-text-1">{item.result}</dd>
                </div>
              </dl>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
