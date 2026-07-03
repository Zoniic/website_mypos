export type StepItem = { title: string; description: string };

export function HowItWorks({
  title,
  steps,
}: {
  title: string;
  steps: StepItem[];
}) {
  return (
    <section className="border-y border-border bg-surface-0 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>

        <ol className="mt-10 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl bg-surface-1 p-6 shadow-sm">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-text-1">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-text-2">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
