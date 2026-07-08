"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
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

export function ProductsExplorer({
  products,
  initialSearch = "",
  initialCategory = "",
  initialBusinessType = "",
  initialOs = "",
  initialScreenSize = "",
}: {
  products: Product[];
  initialSearch?: string;
  initialCategory?: string;
  initialBusinessType?: string;
  initialOs?: string;
  initialScreenSize?: string;
}) {
  const t = useTranslations("productsCommon");
  const router = useRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(initialSearch);
  const [businessType, setBusinessType] = useState(initialBusinessType);
  const [os, setOs] = useState(initialOs);
  const [screenSize, setScreenSize] = useState(initialScreenSize);
  const [category, setCategory] = useState(initialCategory);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const hasActiveFilters = Boolean(search || businessType || os || screenSize || category);
  const lastQuery = useRef(
    new URLSearchParams({
      ...(initialSearch && { q: initialSearch }),
      ...(initialCategory && { category: initialCategory }),
      ...(initialBusinessType && { businessType: initialBusinessType }),
      ...(initialOs && { os: initialOs }),
      ...(initialScreenSize && { screenSize: initialScreenSize }),
    }).toString()
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (businessType) params.set("businessType", businessType);
    if (os) params.set("os", os);
    if (screenSize) params.set("screenSize", screenSize);
    const query = params.toString();
    if (query === lastQuery.current) return;
    lastQuery.current = query;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [search, category, businessType, os, screenSize, pathname, router]);

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
          product.categories.some((c) => t(`categories.${c}`).toLowerCase().includes(query));
        if (!matchesQuery) return false;
      }
      if (businessType && !product.businessTypes.includes(businessType as BusinessType)) {
        return false;
      }
      if (os && product.specs.os !== os) return false;
      if (screenSize && product.specs.screenSize !== screenSize) return false;
      if (category && !product.categories.includes(category as ProductCategory)) return false;
      return true;
    });
  }, [products, search, businessType, os, screenSize, category, t]);

  function clearFilters() {
    setSearch("");
    setBusinessType("");
    setOs("");
    setScreenSize("");
    setCategory("");
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 sm:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          className="flex items-center gap-2 rounded-lg border border-border-strong px-3 py-2 text-sm font-medium text-text-1"
        >
          {filtersOpen ? t("hideFilters") : t("showFilters")}
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-[image:var(--gradient-primary)]" />
          )}
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-primary-400 hover:underline"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>

      <div
        className={`mt-4 grid gap-4 sm:mt-0 sm:grid-cols-2 lg:grid-cols-5 ${
          filtersOpen ? "grid" : "hidden sm:grid"
        }`}
      >
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

      <div className="mt-6 hidden items-center justify-between sm:flex">
        <p className="text-sm text-text-2">{t("resultsCount", { count: filtered.length })}</p>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-primary-400 hover:underline"
          >
            {t("clearFilters")}
          </button>
        )}
      </div>
      <p className="mt-4 text-sm text-text-2 sm:hidden">
        {t("resultsCount", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border-strong p-8 text-center text-text-2">
          <p>{t("noResults")}</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-button border border-border-strong px-4 py-2 text-sm font-semibold text-text-1 transition-colors hover:border-primary-400/40 hover:text-primary-400"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>
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
