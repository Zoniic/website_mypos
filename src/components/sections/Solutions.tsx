import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { MachineArt, type MachineKind } from "@/components/ui/MachineArt";
import { getSiteImages } from "@/lib/siteSettings";

// Heights are in proportion to the real machines, so the four read as one
// product family standing on the same floor.
const family: {
  key: string;
  imageKey: string;
  href: string;
  machine: MachineKind;
  artHeight: string;
}[] = [
  { key: "selfOrder", imageKey: "solution-self-order", href: "/solutions/self-order", machine: "kiosk", artHeight: "h-[88%]" },
  { key: "pos", imageKey: "solution-pos", href: "/solutions/pos", machine: "pos", artHeight: "h-[34%]" },
  { key: "weighPay", imageKey: "solution-weigh-pay", href: "/solutions/weigh-pay", machine: "scale", artHeight: "h-[32%]" },
  { key: "ticketing", imageKey: "solution-ticketing", href: "/solutions/ticketing", machine: "ticket", artHeight: "h-[82%]" },
];

export async function Solutions() {
  const t = await getTranslations("home.solutions");
  const images = await getSiteImages();

  return (
    <section id="solutions" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader title={t("title")} />

      <ul className="mt-12 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 sm:gap-y-10 lg:mt-14 lg:grid-cols-4">
        {family.map((item, index) => {
          const photo = images[item.imageKey];
          return (
            <li key={item.key} className="h-full">
              <FadeIn delay={index * 0.06} className="h-full">
                <Link
                  href={item.href}
                  className="group flex h-full flex-col rounded-[22px] outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                >
                  <div className="stage-grid-ink relative flex aspect-[4/5] items-end justify-center overflow-hidden rounded-[22px] bg-surface-2 transition-colors duration-300 group-hover:bg-primary-50">
                    {photo ? (
                      <Image
                        src={photo}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    ) : (
                      <>
                        <span aria-hidden className="absolute inset-x-6 bottom-[10%] h-px bg-text-1/15" />
                        <MachineArt
                          kind={item.machine}
                          className={`relative mb-[10%] ${item.artHeight} transition-transform duration-500 ease-out group-hover:-translate-y-1.5`}
                        />
                      </>
                    )}
                  </div>
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
                  </p>                </Link>
              </FadeIn>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
