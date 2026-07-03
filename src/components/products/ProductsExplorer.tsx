"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/products/ProductCard";
import type { BusinessType, Product, ProductCategory } from "@/lib/products";

const categories: ProductCategory[] = ["self-order", "weigh-pay", "pos", "ticketing"];
const osOptions = ["Android", "Windows"] as const;

function FilterSelect({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-text-2">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border border-border-strong px-3 py-2 text-sm"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ProductsExplorer({ products }: { products: Product[] }) {
  const t = useTranslations("productsCommon");
  const [search, setSearch] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [os, setOs] = useState("");
  const [screenSize, setScreenSize] = useState("");
  const [category, setCategory] = useState("");

  const businessTypes = useMemo(() => {
    const set = new Set<BusinessType>();
    products.forEach((product) => product.businessTypes.forEach((bt) => set.add(bt)));
    return Array.from(set);
  }, [products]);

  const screenSizes = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.specs.screenSize)));
  }, [products]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (query) {
        const matchesQuery =
          product.name.toLowerCase().includes(query) ||
          t(`categories.${product.category}`).toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      if (businessType && !product.businessTypes.includes(businessType as BusinessType)) {
        return false;
      }
      if (os && product.specs.os !== os) return false;
      if (screenSize && product.specs.screenSize !== screenSize) return false;
      if (category && product.category !== category) return false;
      return true;
    });
  }, [products, search, businessType, os, screenSize, category, t]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-1">
          <span className="font-medium text-text-2">{t("searchPlaceholder")}</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="rounded-lg border border-border-strong px-3 py-2 text-sm"
          />
        </label>

        <FilterSelect
          label={t("filterCategory")}
          value={category}
          onChange={setCategory}
          allLabel={t("allLabel")}
          options={categories.map((c) => ({ value: c, label: t(`categories.${c}`) }))}
        />
        <FilterSelect
          label={t("filterBusinessType")}
          value={businessType}
          onChange={setBusinessType}
          allLabel={t("allLabel")}
          options={businessTypes.map((bt) => ({ value: bt, label: t(`businessTypes.${bt}`) }))}
        />
        <FilterSelect
          label={t("filterOs")}
          value={os}
          onChange={setOs}
          allLabel={t("allLabel")}
          options={osOptions.map((value) => ({ value, label: value }))}
        />
        <FilterSelect
          label={t("filterScreenSize")}
          value={screenSize}
          onChange={setScreenSize}
          allLabel={t("allLabel")}
          options={screenSizes.map((value) => ({ value, label: value }))}
        />
      </div>

      <p className="mt-6 text-sm text-text-2">
        {t("resultsCount", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-border-strong p-8 text-center text-text-2">
          {t("noResults")}
        </p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
