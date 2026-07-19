import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const tNav = await getTranslations("nav");

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <p className="font-display text-7xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-text-2">{t("message")}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button href="/" variant="primary">
          {t("backHome")}
        </Button>
        <Button href="/products" variant="line">
          {tNav("products")}
        </Button>
        <Link
          href="/contact"
          className="text-sm font-medium text-text-2 underline-offset-4 hover:text-text-1 hover:underline"
        >
          {t("contactUs")}
        </Link>
      </div>
    </div>
  );
}
