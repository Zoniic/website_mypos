import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function About() {
  const t = useTranslations("home.about");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <PlaceholderImage ratio="4/3" label="Team / factory photo" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-text-2">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-text-2">{t("description")}</p>
          <Link
            href="/about"
            className="mt-6 inline-block text-sm font-semibold underline underline-offset-4"
          >
            {t("cta")}
          </Link>
        </div>
      </div>
    </section>
  );
}
