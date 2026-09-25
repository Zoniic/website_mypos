import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { getSiteSettings } from "@/lib/siteSettings";

/** Closing call to action: book a demo, or open a LINE chat if configured. */
export async function Invite() {
  const t = await getTranslations("home.invite");
  const tIndustries = await getTranslations("industries.common");
  const tContact = await getTranslations("contact");
  const settings = await getSiteSettings();

  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <FadeIn className="max-w-3xl">
          <h2 className="font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
            {t("title")}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">{t("description")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/contact?topic=demo" variant="primary" size="lg">
              {tIndustries("ctaDemo")}
            </Button>
            {settings.lineUrl ? (
              <Button href={settings.lineUrl} external variant="line" size="lg">
                {tContact("lineCta")}
              </Button>
            ) : (
              <Button
                href="/contact"
                variant="ghost"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                {t("cta")}
              </Button>
            )}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
