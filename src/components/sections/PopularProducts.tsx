import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { getFeaturedProducts } from "@/lib/products";

export async function PopularProducts() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "home.products" });
  const featured = await getFeaturedProducts(locale);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
        </div>
        <Button href="/products" variant="ghost">
          {t("cta")}
        </Button>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
