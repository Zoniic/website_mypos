import { getLocale, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/products/ProductCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getFeaturedProducts } from "@/lib/products";

export async function PopularProducts() {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "home.products" });
  const featured = await getFeaturedProducts(locale);

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        action={
          <Button href="/products" variant="ghost">
            {t("cta")}
          </Button>
        }
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
