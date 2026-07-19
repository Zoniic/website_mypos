"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { FadeIn } from "@/components/ui/FadeIn";
import { Link } from "@/i18n/navigation";

export type ReferenceCase = {
  slug: string;
  business: string;
  businessType: string;
  problem: string;
  install: string;
  result: string;
  imageUrl?: string;
  logoUrl?: string;
};

export function ReferencesExplorer({
  cases,
  businessTypeLabels,
  filterLabel,
  allLabel,
  noResults,
  clearFilters,
  noPhoto,
  problemLabel,
  installLabel,
  resultLabel,
}: {
  cases: ReferenceCase[];
  businessTypeLabels: Record<string, string>;
  filterLabel: string;
  allLabel: string;
  noResults: string;
  clearFilters: string;
  noPhoto: string;
  problemLabel: string;
  installLabel: string;
  resultLabel: string;
}) {
  const [businessType, setBusinessType] = useState("");

  const businessTypes = useMemo(() => {
    return Array.from(new Set(cases.map((item) => item.businessType)));
  }, [cases]);

  const filtered = useMemo(() => {
    if (!businessType) return cases;
    return cases.filter((item) => item.businessType === businessType);
  }, [cases, businessType]);

  return (
    <div>
      <label className="flex max-w-xs flex-col gap-1 text-sm">
        <span className="font-medium text-text-2">{filterLabel}</span>
        <select
          value={businessType}
          onChange={(event) => setBusinessType(event.target.value)}
          className="rounded-lg border border-border-strong px-3 py-2 text-sm"
        >
          <option value="">{allLabel}</option>
          {businessTypes.map((type) => (
            <option key={type} value={type}>
              {businessTypeLabels[type] ?? type}
            </option>
          ))}
        </select>
      </label>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-border-strong p-8 text-center text-text-2">
          <p>{noResults}</p>
          {businessType && (
            <button
              type="button"
              onClick={() => setBusinessType("")}
              className="mt-4 rounded-button border border-border-strong px-4 py-2 text-sm font-semibold text-text-1 transition-colors hover:border-primary-400/40 hover:text-primary-600"
            >
              {clearFilters}
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, index) => (
            <FadeIn key={item.slug} delay={(index % 6) * 0.06}>
              <Link
                href={`/references/${item.slug}`}
                className="group block h-full overflow-hidden rounded-card border border-border bg-surface-1/40 transition-all hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)]">
                {item.imageUrl ? (
                  <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                    <Image
                      src={item.imageUrl}
                      alt={`${item.business} — on-site installation`}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-surface-2 text-xs text-text-2">
                    {noPhoto}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-block rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-2">
                      {businessTypeLabels[item.businessType] ?? item.businessType}
                    </span>
                    {item.logoUrl && (
                      <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border bg-surface-0">
                        <Image src={item.logoUrl} alt={`${item.business} logo`} fill sizes="36px" className="object-contain p-1" />
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{item.business}</h3>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div>
                      <dt className="font-medium text-text-2">{problemLabel}</dt>
                      <dd className="mt-1 text-text-2">{item.problem}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-text-2">{installLabel}</dt>
                      <dd className="mt-1 text-text-2">{item.install}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-text-2">{resultLabel}</dt>
                      <dd className="mt-1 font-semibold text-text-1">{item.result}</dd>
                    </div>
                  </dl>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
