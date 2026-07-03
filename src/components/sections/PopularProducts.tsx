import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { getFeaturedProducts } from "@/lib/products";

export async function PopularProducts() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "home.products" });
  const format = await getFormatter({ locale });
  const featured = await getFeaturedProducts(locale);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-text-2">
            {t("eyebrow")}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            {t("title")}
          </h2>
        </div>
        <Button href="/products" variant="ghost">
          {t("cta")}
        </Button>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((product) => (
          <Link
            key={product.slug}
            href={`/products/${product.slug}`}
            className="group rounded-2xl border border-border p-4 transition-shadow hover:shadow-md"
          >
            <PlaceholderImage
              ratio="1/1"
              label={`${product.name} photo`}
            />
            <h3 className="mt-4 font-semibold">{product.name}</h3>
            <p className="mt-1 text-sm text-text-2">
              {t("priceFrom")} {format.number(product.priceFrom, { style: "currency", currency: "THB", maximumFractionDigits: 0 })}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
