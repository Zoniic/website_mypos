"use client";

import { motion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { StockBadge } from "@/components/products/StockBadge";
import { useQuoteCart } from "@/lib/quoteCart";
import type { Product } from "@/lib/products";
import { solutionMachine } from "@/data/solutions";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("productsCommon");
  const format = useFormatter();
  const { addItem, removeItem, isInCart } = useQuoteCart();
  const inCart = isInCart(product.slug);

  return (
    <motion.div
      initial={{ y: 16 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          inCart
            ? removeItem(product.slug)
            : addItem({
                slug: product.slug,
                name: product.name,
                imageUrl: product.imageUrl,
                priceFrom: product.priceFrom,
              })
        }
        aria-pressed={inCart}
        aria-label={inCart ? t("removeFromCompare") : t("addToCompare")}
        className={`absolute right-6 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
          inCart
            ? "border-primary-400 bg-primary-400 text-text-1"
            : "border-border-strong bg-surface-0/90 text-text-2 hover:border-primary-400/40 hover:text-primary-600"
        }`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          {inCart ? (
            <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          )}
        </svg>
      </button>

      <Link
        href={`/products/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface-1/40 p-4 transition-all hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)]"
      >
        <div className="overflow-hidden rounded-lg">
          <PlaceholderImage
            ratio="1/1"
            label={`${product.name} photo`}
            src={product.imageUrl}
            machine={product.categories[0] ? solutionMachine[product.categories[0]] : undefined}
            className="transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
        <h3 className="mt-4 font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm text-text-2">
          {t("priceFrom")}{" "}
          {format.number(product.priceFrom, {
            style: "currency",
            currency: "THB",
            maximumFractionDigits: 0,
          })}
        </p>
        <div className="mt-2">
          <StockBadge
            status={product.stockStatus}
            leadTimeDays={product.leadTimeDays}
            labels={{
              inStock: t("stockInStock"),
              preorder: t("stockPreorder"),
              outOfStock: t("stockOutOfStock"),
              leadTime: t.raw("leadTimeLabel"),
            }}
          />
        </div>
        <span className="mt-3 text-sm font-semibold underline-offset-4 group-hover:underline">
          {t("viewDetails")}
        </span>
      </Link>
    </motion.div>
  );
}
