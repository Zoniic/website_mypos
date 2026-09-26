import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Invite } from "@/components/sections/Invite";
import { Link } from "@/i18n/navigation";
import { getSiteImages } from "@/lib/siteSettings";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "software" });
  const alternates = buildAlternates(locale, "/software");

  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates,
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: alternates.canonical,
      siteName: siteConfig.name,
      locale,
      type: "website",
    },
  };
}

type FeatureItem = { title: string; description: string };
/** One app in the "features by app" list — admin-editable JSON (Page Content → software → apps.items). */
type AppItem = { name: string; summary?: string; href?: string; points?: string[] };

export default async function SoftwarePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "software" });
  const features = t.raw("features.items") as FeatureItem[];
  const couponSteps = (t.has("coupons.steps") ? t.raw("coupons.steps") : []) as FeatureItem[];
  const couponWorksOn = (t.has("coupons.worksOn") ? t.raw("coupons.worksOn") : []) as string[];
  const managedLines = (t.has("managed.items") ? t.raw("managed.items") : []) as string[];
  const appsRaw: unknown = t.has("apps.items") ? t.raw("apps.items") : [];
  const apps = (Array.isArray(appsRaw) ? appsRaw : []).filter(
    (app): app is AppItem => typeof app === "object" && app !== null && typeof (app as AppItem).name === "string"
  );
  const images = await getSiteImages();

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${siteConfig.name} Software`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Android, Windows",
    url: `${siteConfig.url}/${locale}/software`,
  };

  return (
    <>
      <JsonLd data={softwareSchema} />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-semibold text-primary-600">{t("hero.eyebrow")}</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 text-lg text-text-2">{t("hero.subtitle")}</p>
          <div className="mt-8">
            <Button href="/contact" variant="primary" size="lg">
              {t("hero.cta")}
            </Button>
          </div>
        </div>
        <PlaceholderImage
          ratio="4/3"
          label="Software UI photo"
          src={images["software-hero"]}
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </section>

      <section className="border-y border-border bg-surface-0 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            {t("features.title")}
          </h2>
          <ul className="mt-10 grid gap-x-12 border-t border-border sm:grid-cols-2">
            {features.map((feature) => (
              <li key={feature.title} className="border-b border-border py-6">
                <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-text-2">{feature.description}</p>
              </li>
            ))}
          </ul>
          {managedLines.length > 0 && (
            <div className="mt-12">
              <h3 className="text-sm font-semibold text-text-1">{t("managed.title")}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {managedLines.map((line) => (
                  <li key={line} className="rounded-full border border-border-strong bg-white px-3 py-1.5 text-sm">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {apps.length > 0 && (
        <section id="apps" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t("apps.title")}</h2>
          {t.has("apps.lede") && <p className="mt-4 max-w-2xl leading-relaxed text-text-2">{t("apps.lede")}</p>}
          <div className="mt-12 border-t-2 border-text-1">
            {apps.map((app) => (
              <article key={app.name} className="grid gap-6 border-b border-border py-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <h3 className="font-display text-xl font-semibold">{app.name}</h3>
                  {app.summary && <p className="mt-2 text-sm leading-relaxed text-text-2">{app.summary}</p>}
                  {app.href && app.href.startsWith("/") && (
                    <Link
                      href={app.href}
                      className="mt-3 inline-block rounded-sm text-sm font-semibold text-primary-600 underline-offset-4 outline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                    >
                      {t("apps.more")} →
                    </Link>
                  )}
                </div>
                <ul className="grid gap-x-10 gap-y-3 sm:grid-cols-2 lg:col-span-8">
                  {(Array.isArray(app.points) ? app.points : []).map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-relaxed">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 bg-primary-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}

      {couponSteps.length > 0 && (
        <section id="coupons" className="scroll-mt-24 bg-ink text-white">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-5">
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{t("coupons.title")}</h2>
              <p className="mt-4 leading-relaxed text-white/75">{t("coupons.lede")}</p>
              {couponWorksOn.length > 0 && (
                <>
                  <p className="mt-8 text-sm font-semibold">{t("coupons.worksOnTitle")}</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {couponWorksOn.map((line) => (
                      <li key={line} className="rounded-full border border-white/25 px-3 py-1.5 text-sm text-white/90">
                        {line}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <ol className="lg:col-span-7">
              {couponSteps.map((step, index) => (
                <li key={step.title} className="flex gap-5 border-t border-white/15 py-6">
                  <span className="font-display text-2xl font-semibold text-primary-400">{index + 1}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/70">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("screenshots.title")}
        </h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <PlaceholderImage
            ratio="4/3"
            label="Dashboard screenshot"
            src={images["software-screenshot-dashboard"]}
          />
          <PlaceholderImage
            ratio="4/3"
            label="Menu management screenshot"
            src={images["software-screenshot-menu"]}
          />
          <PlaceholderImage
            ratio="4/3"
            label="Sales report screenshot"
            src={images["software-screenshot-sales"]}
          />
        </div>
      </section>

      <Invite />
    </>
  );
}
