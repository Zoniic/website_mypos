import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MachineArt, type MachineKind } from "@/components/ui/MachineArt";
import { TiltedCard } from "@/components/reactbits/TiltedCard";
import { getSiteImages } from "@/lib/siteSettings";

type Line = { key: string; slug: string; machine: MachineKind; artHeight: string };

// The restaurant system, in the order an order travels: taken at the kiosk
// or counter, cooked from the kitchen screen, collected when the queue
// display calls it. Heights keep the machines in proportion to each other.
const primary: Line[] = [
  { key: "selfOrder", slug: "self-order", machine: "kiosk", artHeight: "h-[88%]" },
  { key: "pos", slug: "pos", machine: "pos", artHeight: "h-[34%]" },
  { key: "kds", slug: "kds", machine: "kds", artHeight: "h-[33%]" },
  { key: "queueDisplay", slug: "queue-display", machine: "queue", artHeight: "h-[30%]" },
];

// The other lines, compact: weigh-and-pay, 24-hour vending, ticketing.
const secondary: Line[] = [
  { key: "weighPay", slug: "weigh-pay", machine: "scale", artHeight: "h-[44%]" },
  { key: "vendingOnline", slug: "vending-online", machine: "vending", artHeight: "h-[86%]" },
  { key: "vendingOffline", slug: "vending-offline", machine: "vending", artHeight: "h-[86%]" },
  { key: "ticketing", slug: "ticketing", machine: "ticket", artHeight: "h-[84%]" },
];

export async function Solutions() {
  const t = await getTranslations("home.solutions");
  const images = await getSiteImages();

  return (
    <section id="solutions" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader title={t("title")} />

      <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:mt-14 lg:grid-cols-4">
        {primary.map((item, index) => {
          const photo = images[`solution-${item.slug}`];
          return (
            <li key={item.key} className="h-full">
              <FadeIn delay={index * 0.06} className="h-full">
                <Link
                  href={`/solutions/${item.slug}`}
                  className="group flex h-full flex-col rounded-[22px] outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                >
                  <TiltedCard>
                    <div className="stage-grid-ink relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-[22px] bg-surface-2 transition-colors duration-300 group-hover:bg-primary-50">
                      {photo ? (
                        <Image
                          src={photo}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 25vw, 50vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                        />
                      ) : (
                        <>
                          <span aria-hidden className="absolute inset-x-6 bottom-[10%] h-px bg-text-1/15" />
                          <MachineArt
                            kind={item.machine}
                            className={`relative mb-[10%] ${item.artHeight} max-w-[88%] transition-transform duration-500 ease-out group-hover:-translate-y-1.5 [&_svg]:max-w-full`}
                          />
                        </>
                      )}
                    </div>
                  </TiltedCard>
                  <div className="mt-4 flex items-baseline justify-between gap-3 px-1 sm:mt-5">
                    <h3 className="font-display text-lg font-semibold leading-snug sm:text-xl">
                      {t(`items.${item.key}.title`)}
                    </h3>
                    <span
                      aria-hidden
                      className="text-primary-600 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </div>
                  <p className="mt-2 px-1 text-sm leading-relaxed text-text-2">
                    {t(`items.${item.key}.description`)}
                  </p>
                </Link>
              </FadeIn>
            </li>
          );
        })}
      </ul>

      <h3 className="mt-20 font-display text-xl font-semibold sm:text-2xl">{t("moreTitle")}</h3>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {secondary.map((item) => (
          <li key={item.key}>
            <Link
              href={`/solutions/${item.slug}`}
              className="group flex h-full items-stretch gap-4 rounded-[18px] border border-border p-3 outline-offset-4 transition-colors hover:border-border-strong hover:bg-surface-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
            >
              <span
                aria-hidden
                className="stage-grid-ink flex h-24 w-20 shrink-0 items-end justify-center overflow-hidden rounded-[12px] bg-surface-2 pb-2"
              >
                <MachineArt kind={item.machine} className={item.artHeight} />
              </span>
              <span className="flex min-w-0 flex-col justify-center py-1">
                <span className="font-display text-base font-semibold leading-snug">
                  {t(`items.${item.key}.title`)}
                  <span aria-hidden className="ml-1 text-primary-600 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
                <span className="mt-1 text-sm leading-snug text-text-2">{t(`items.${item.key}.description`)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
