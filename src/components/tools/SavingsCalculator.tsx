"use client";

import { useId, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

type Inputs = {
  ordersPerDay: number;
  openDays: number;
  avgTicket: number;
  staffSaved: number;
  staffCost: number;
  upsellPercent: number;
  marginPercent: number;
  investment: number;
  monthlyFee: number;
};

// Deliberately conservative starting values; every one is editable.
const DEFAULTS: Inputs = {
  ordersPerDay: 150,
  openDays: 30,
  avgTicket: 120,
  staffSaved: 0.5,
  staffCost: 12000,
  upsellPercent: 3,
  marginPercent: 60,
  investment: 50000,
  monthlyFee: 0,
};

function calculateSavings(input: Inputs) {
  const laborSavings = input.staffSaved * input.staffCost;
  const monthlyRevenue = input.ordersPerDay * input.openDays * input.avgTicket;
  const extraProfit = monthlyRevenue * (input.upsellPercent / 100) * (input.marginPercent / 100);
  const monthlyBenefit = laborSavings + extraProfit - input.monthlyFee;
  const paybackMonths = monthlyBenefit > 0 ? input.investment / monthlyBenefit : null;
  const yearOne = monthlyBenefit * 12 - input.investment;
  return { laborSavings, extraProfit, monthlyBenefit, paybackMonths, yearOne };
}

function NumberField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-text-1">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-text-2">{hint}</p>}
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={Number.isFinite(value) ? value : ""}
        onChange={(event) => {
          const next = Number(event.target.value);
          onChange(Number.isFinite(next) ? Math.max(min, next) : 0);
        }}
        className="mt-1.5 w-full rounded-input border border-border-strong bg-surface-0 px-3 py-2 text-base tabular-nums text-text-1 transition-colors focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
      />
    </div>
  );
}

export function SavingsCalculator() {
  const t = useTranslations("savingsCalculator");
  const format = useFormatter();
  const [input, setInput] = useState<Inputs>(DEFAULTS);
  const result = calculateSavings(input);

  const set = (key: keyof Inputs) => (value: number) => setInput((prev) => ({ ...prev, [key]: value }));
  const baht = (value: number) =>
    format.number(value, { style: "currency", currency: "THB", maximumFractionDigits: 0 });

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
      <section
        aria-labelledby="calc-inputs"
        className="rounded-card border border-border bg-surface-1/40 p-6 sm:p-8"
      >
        <h2 id="calc-inputs" className="text-xl font-semibold">
          {t("inputsTitle")}
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <NumberField label={t("ordersPerDay")} value={input.ordersPerDay} onChange={set("ordersPerDay")} />
          <NumberField label={t("openDays")} value={input.openDays} onChange={set("openDays")} max={31} />
          <NumberField label={t("avgTicket")} value={input.avgTicket} onChange={set("avgTicket")} />
          <NumberField
            label={t("staffSaved")}
            value={input.staffSaved}
            onChange={set("staffSaved")}
            step={0.5}
          />
          <NumberField
            label={t("staffCost")}
            hint={t("staffCostHint")}
            value={input.staffCost}
            onChange={set("staffCost")}
            step={500}
          />
          <NumberField
            label={t("upsellPercent")}
            hint={t("upsellHint")}
            value={input.upsellPercent}
            onChange={set("upsellPercent")}
            max={100}
            step={0.5}
          />
          <NumberField
            label={t("marginPercent")}
            value={input.marginPercent}
            onChange={set("marginPercent")}
            max={100}
          />
          <NumberField
            label={t("investment")}
            hint={t("investmentHint")}
            value={input.investment}
            onChange={set("investment")}
            step={1000}
          />
          <NumberField label={t("monthlyFee")} value={input.monthlyFee} onChange={set("monthlyFee")} step={100} />
        </div>
      </section>

      <section
        aria-labelledby="calc-results"
        aria-live="polite"
        className="rounded-card border border-primary-200 bg-primary-50 p-6 sm:p-8 lg:sticky lg:top-24"
      >
        <h2 id="calc-results" className="text-xl font-semibold">
          {t("resultsTitle")}
        </h2>
        <dl className="mt-6 space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-text-2">{t("laborSavings")}</dt>
            <dd className="font-semibold tabular-nums">{baht(result.laborSavings)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-text-2">{t("extraProfit")}</dt>
            <dd className="font-semibold tabular-nums">{baht(result.extraProfit)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4 border-t border-primary-200 pt-4">
            <dt className="text-sm font-medium text-text-1">{t("monthlyBenefit")}</dt>
            <dd className="text-lg font-bold tabular-nums">{baht(result.monthlyBenefit)}</dd>
          </div>
        </dl>

        <div className="mt-6 rounded-lg bg-surface-0 p-5">
          <p className="text-sm text-text-2">{t("payback")}</p>
          <p className="mt-1 font-display text-4xl font-bold tracking-tight text-primary-600 tabular-nums">
            {result.paybackMonths === null
              ? t("paybackNever")
              : t("paybackMonths", {
                  months: format.number(result.paybackMonths, { maximumFractionDigits: 1 }),
                })}
          </p>
          <p className="mt-4 text-sm text-text-2">{t("yearOne")}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{baht(result.yearOne)}</p>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-text-2">{t("disclaimer")}</p>

        <div className="mt-6 border-t border-primary-200 pt-6">
          <p className="font-semibold">{t("ctaTitle")}</p>
          <p className="mt-1 text-sm text-text-2">{t("ctaBody")}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/contact?topic=demo" variant="primary">
              {t("ctaDemo")}
            </Button>
            <Button href="/contact?topic=quote" variant="ghost">
              {t("ctaQuote")}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
