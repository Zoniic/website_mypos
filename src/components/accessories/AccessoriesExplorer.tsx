"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Accessory } from "@/lib/accessories";
import type { ProductCategory } from "@/lib/products";
import { AccessoryCard } from "@/components/accessories/AccessoryCard";


export function AccessoriesExplorer({
  items,
  initialCategory = "",
  filterLabel,
  allLabel,
  noResults,
  shopOn = false,
  categoryOrder,
}: {
  items: Accessory[];
  /** Category order for the filter (built-in + published catalog lines). */
  categoryOrder: ProductCategory[];
  initialCategory?: string;
  filterLabel: string;
  allLabel: string;
  noResults: string;
  /** Online ordering is enabled: an accessory without its own price shows its online price. */
  shopOn?: boolean;
}) {
  const t = useTranslations("productsCommon");
  const [category, setCategory] = useState(initialCategory);

  const availableCategories = useMemo(() => {
    const set = new Set<ProductCategory>();
    items.forEach((item) => item.categories.forEach((c) => set.add(c)));
    return categoryOrder.filter((c) => set.has(c));
  }, [items, categoryOrder]);

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
          {filtered.map((item) => (
            <AccessoryCard key={item.slug} item={item} shopOn={shopOn} />
          ))}
        </div>
      )}
    </div>
  );
}
