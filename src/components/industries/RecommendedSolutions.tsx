import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MachineArt, type MachineKind } from "@/components/ui/MachineArt";

export type RecommendedSolution = { slug: string; label: string; blurb: string; machine: MachineKind };

const artHeight: Record<MachineKind, string> = {
  kiosk: "h-[80%]",
  ticket: "h-[76%]",
  pos: "h-[42%]",
  scale: "h-[40%]",
};

export function RecommendedSolutions({
  id,
  title,
  lede,
  viewLabel,
  items,
}: {
  id?: string;
  title: string;
  lede: string;
  viewLabel: string;
  items: RecommendedSolution[];
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeader title={title} lede={lede} />
      <ul className="mt-12 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.slug}>
            <FadeIn delay={index * 0.06} className="h-full">
              <Link
                href={`/solutions/${item.slug}`}
                className="group flex h-full flex-col rounded-[22px] outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              >
                <div className="stage-grid-ink relative flex aspect-[4/3] items-end justify-center overflow-hidden rounded-[22px] bg-surface-2 transition-colors duration-300 group-hover:bg-primary-50">
                  <span aria-hidden className="absolute inset-x-6 bottom-[11%] h-px bg-text-1/15" />
                  <MachineArt
                    kind={item.machine}
                    className={`relative mb-[11%] ${artHeight[item.machine]} transition-transform duration-500 ease-out group-hover:-translate-y-1.5`}
                  />
                </div>
                <h3 className="mt-5 px-1 font-display text-xl font-semibold">{item.label}</h3>
                <p className="mt-2 flex-1 px-1 text-sm leading-relaxed text-text-2">{item.blurb}</p>
                <span className="mt-4 px-1 text-sm font-semibold text-primary-600 underline-offset-4 group-hover:underline">
                  {viewLabel} →
                </span>
              </Link>
            </FadeIn>
          </li>
        ))}
      </ul>
    </section>
  );
}
