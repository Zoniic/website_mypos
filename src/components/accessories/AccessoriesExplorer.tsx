"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { FadeIn } from "@/components/ui/FadeIn";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import type { Accessory } from "@/lib/accessories";
import type { ProductCategory } from "@/lib/products";

const categoryOrder: ProductCategory[] = ["self-order", "weigh-pay", "pos", "ticketing"];

export function AccessoriesExplorer({
  items,
  initialCategory = "",
  filterLabel,
  allLabel,
  noResults,
}: {
  items: Accessory[];
  initialCategory?: string;
  filterLabel: string;
  allLabel: string;
  noResults: string;
}) {
  const t = useTranslations("productsCommon");
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
            className="rounded-lg border border-border-strong bg-surface-0 px-3 py-2 text-sm text-text-1"
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
              <div className="group h-full overflow-hidden rounded-card border border-border bg-surface-1/40 p-4 transition-all hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)]">
                <div className="overflow-hidden rounded-lg">
                  <PlaceholderImage
                    ratio="1/1"
                    label={`${item.name} photo`}
                    src={item.imageUrl}
                    className="transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-4 font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm text-text-2">{item.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}

