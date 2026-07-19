"use client";

import { useQuoteCart } from "@/lib/quoteCart";

export function AddToCompareButton({
  slug,
  name,
  imageUrl,
  priceFrom,
  addLabel,
  removeLabel,
}: {
  slug: string;
  name: string;
  imageUrl?: string;
  priceFrom: number;
  addLabel: string;
  removeLabel: string;
}) {
  const { addItem, removeItem, isInCart } = useQuoteCart();
  const inCart = isInCart(slug);

  return (
    <button
      type="button"
      onClick={() => (inCart ? removeItem(slug) : addItem({ slug, name, imageUrl, priceFrom }))}
      aria-pressed={inCart}
      className={`inline-flex items-center justify-center gap-2 rounded-button border px-6 py-3.5 text-lg font-semibold transition-all hover:-translate-y-0.5 ${
        inCart
          ? "border-primary-400 bg-primary-400/10 text-primary-600"
          : "border-border-strong text-text-1 hover:bg-surface-2"
      }`}
    >
      {inCart ? removeLabel : addLabel}
    </button>
  );
}
