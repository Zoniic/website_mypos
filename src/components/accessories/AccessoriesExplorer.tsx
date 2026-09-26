"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/FadeIn";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import type { Accessory } from "@/lib/accessories";
import type { ProductCategory } from "@/lib/products";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";

const categoryOrder: ProductCategory[] = ["self-order", "weigh-pay", "pos", "ticketing"];

export function AccessoriesExplorer({
  items,
  initialCategory = "",
  filterLabel,
  allLabel,
  noResults,
  shopOn = false,
}: {
  items: Accessory[];
  initialCategory?: string;
  filterLabel: string;
  allLabel: string;
  noResults: string;
  /** Online ordering is enabled: show price + "Add to cart" on priced items. */
  shopOn?: boolean;
}) {
  const t = useTranslations("productsCommon");
  const tShop = useTranslations("shop");
  const format = useFormatter();
  const [category, setCategory] = useState(initialCategory);

  const availableCategories = useMemo(() => {
    const set = new Set<ProductCategory>();
    items.forEach((item) => item.categories.forEach((c) => set.add(c)));
    return categoryOrder.filter((c) => set.has(c));
  }, [items]);

  const filtered = useMemo(() => {
    if (!category) return items;
    return items.filter((item) => item.categories.includes(category as ProductCategory));
  }, [items, category]);

  return (
    <div>
      {availableCategories.length > 0 && (
        <label className="flex max-w-xs flex-col gap-1 text-sm">
          <span className="font-medium text-text-2">{filterLabel}</span>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1 focus-visible:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-400/40"
          >
            <option value="">{allLabel}</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {t(`categories.${c}`)}
              </option>
            ))}
          </select>
        </label>
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border-strong p-8 text-center text-text-2">
          {noResults}
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((item, index) => (
            <FadeIn key={item.slug} delay={(index % 8) * 0.06}>
              <div className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface-1/40 p-4 transition-all hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)]">
                <div className="overflow-hidden rounded-lg">
                  <PlaceholderImage
                    ratio="1/1"
                    label={`${item.name} photo`}
                    src={item.imageUrl}
                    className="transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <h2 className="mt-4 text-base font-semibold">{item.name}</h2>
                <p className="mt-1 text-sm text-text-2">{item.description}</p>
                {((shopOn && item.onlinePrice !== undefined) || item.shopeeUrl || item.lazadaUrl) && (
                  <div className="mt-auto pt-4">
                    {shopOn && item.onlinePrice !== undefined && (
                      <>
                        <p className="font-display text-xl font-semibold">
                          {format.number(item.onlinePrice, { style: "currency", currency: "THB", maximumFractionDigits: 0 })}
                          <span className="ml-1.5 font-sans text-xs font-normal text-text-2">{tShop("priceInclVat")}</span>
                        </p>
                        <AddToCartButton
                          kind="accessory"
                          slug={item.slug}
                          name={item.name}
                          imageUrl={item.imageUrl}
                          unitPrice={item.onlinePrice}
                          category="accessory"
                          size="md"
                          className="mt-3"
                          labels={{ add: tShop("addToCart"), added: tShop("added"), viewCart: tShop("viewCart") }}
                        />
                      </>
                    )}
                    {(item.shopeeUrl || item.lazadaUrl) && (
                      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {item.shopeeUrl && (
                          <a href={item.shopeeUrl} target="_blank" rel="noopener noreferrer" data-item-name={item.name} className="font-medium text-[#c4391d] underline-offset-4 hover:underline">
                            Shopee ↗
                          </a>
                        )}
                        {item.lazadaUrl && (
                          <a href={item.lazadaUrl} target="_blank" rel="noopener noreferrer" data-item-name={item.name} className="font-medium text-[#0f136d] underline-offset-4 hover:underline">
                            Lazada ↗
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}

