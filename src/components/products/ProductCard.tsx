"use client";

import { motion } from "framer-motion";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations("productsCommon");
  const format = useFormatter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border p-4 transition-shadow hover:shadow-md"
      >
        <PlaceholderImage ratio="1/1" label={`${product.name} photo`} src={product.imageUrl} />
        <h3 className="mt-4 font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm text-text-2">
          {t("priceFrom")}{" "}
          {format.number(product.priceFrom, {
            style: "currency",
            currency: "THB",
            maximumFractionDigits: 0,
          })}
        </p>
        <span className="mt-3 text-sm font-semibold underline-offset-4 group-hover:underline">
          {t("viewDetails")}
        </span>
      </Link>
    </motion.div>
  );
}
