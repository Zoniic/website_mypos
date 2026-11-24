"use client";

import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { StockBadge } from "@/components/products/StockBadge";
import { useQuoteCart } from "@/lib/quoteCart";
import type { Accessory } from "@/lib/accessories";
import { accessoryDisplayPrice } from "@/lib/accessoryPrice";

/** Same layout as ProductCard: the whole card opens the detail page, "+" adds it to the quote list. */
export function AccessoryCard({
  item,
  shopOn = false,
  heading: Heading = "h2",
}: {
  item: Accessory;
  shopOn?: boolean;
  /** h2 on the list page, h3 inside a titled section. */
  heading?: "h2" | "h3";
}) {
  const t = useTranslations("productsCommon");
  const format = useFormatter();
  const { addItem, removeItem, isInCart } = useQuoteCart();
  const inCart = isInCart(item.slug, "accessory");
  const price = accessoryDisplayPrice(item, shopOn);

  return (
    <motion.div
      initial={{ y: 16 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="relative h-full"
    >
      <button
        type="button"
        onClick={() =>
          inCart
            ? removeItem(item.slug, "accessory")
            : addItem({ kind: "accessory", slug: item.slug, name: item.name, imageUrl: item.imageUrl, priceFrom: price })
        }
        aria-pressed={inCart}
        aria-label={inCart ? t("removeFromCompare") : t("addToCompare")}
        className={`absolute right-6 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
          inCart
            ? "border-primary-400 bg-primary-400 text-text-1"
            : "border-border-strong bg-surface-0/90 text-text-2 hover:border-primary-400/40 hover:text-primary-600"
        }`}
      >
        {inCart ? (
          <Check size={14} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Plus size={14} strokeWidth={2} aria-hidden="true" />
        )}
      </button>

      <Link
        href={`/accessories/${item.slug}`}
        data-edit-admin={`/admin/goto/accessory/${item.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface-1/40 p-4 transition-all hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)]"
      >
        <div className="overflow-hidden rounded-lg">
          <PlaceholderImage
            ratio="1/1"
            label={`${item.name} photo`}
            src={item.imageUrl}
            className="transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
        <Heading className="mt-4 text-base font-semibold">{item.name}</Heading>
        {price !== null && (
          <p className="mt-1 text-sm text-text-2">
            {t("priceFrom")}{" "}
            {format.number(price, { style: "currency", currency: "THB", maximumFractionDigits: 0 })}
          </p>
        )}
        <div className="mt-2">
          <StockBadge
            status={item.stockStatus}
            leadTimeDays={item.leadTimeDays}
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
