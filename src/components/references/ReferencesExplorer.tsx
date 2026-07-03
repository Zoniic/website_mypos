"use client";

import { useMemo, useState } from "react";

export type ReferenceCase = {
  business: string;
  businessType: string;
  problem: string;
  install: string;
  result: string;
};

export function ReferencesExplorer({
  cases,
  businessTypeLabels,
  filterLabel,
  allLabel,
  noResults,
  problemLabel,
  installLabel,
  resultLabel,
}: {
  cases: ReferenceCase[];
  businessTypeLabels: Record<string, string>;
  filterLabel: string;
  allLabel: string;
  noResults: string;
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
        <p className="mt-10 rounded-xl border border-dashed border-border-strong p-8 text-center text-text-2">
          {noResults}
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.business} className="rounded-2xl border border-border p-6">
              <span className="inline-block rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-2">
                {businessTypeLabels[item.businessType] ?? item.businessType}
              </span>
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
          ))}
        </div>
      )}
    </div>
  );
}
