import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { getSiteImages } from "@/lib/siteSettings";

export async function About() {
  const t = await getTranslations("home.about");
  const images = await getSiteImages();
  const photo = images["about-team"];

  const text = (
    <>
      <p className="text-lg leading-relaxed text-text-2">{t("description")}</p>
      <Link
        href="/about"
        className="group mt-6 inline-flex items-center gap-1.5 rounded-sm font-semibold text-primary-600 underline-offset-4 outline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
      >
        {t("cta")}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </Link>
    </>
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
        <FadeIn className="lg:col-span-5">
          <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          {photo ? <div className="mt-6">{text}</div> : null}
        </FadeIn>

        {photo ? (
          <FadeIn delay={0.08} className="relative aspect-[16/10] overflow-hidden rounded-[22px] lg:col-span-7">
            <Image src={photo} alt="" fill sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover" data-edit-image="about-team" />
          </FadeIn>
        ) : (
          <FadeIn delay={0.08} className="lg:col-span-6 lg:col-start-7 lg:pt-3">
            {text}
          </FadeIn>
        )}
      </div>
    </section>
  );
}
