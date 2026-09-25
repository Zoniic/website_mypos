"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useShopCart, type CartItemKind } from "@/lib/shopCart";
import { track } from "@/lib/analytics";

export function AddToCartButton({
  kind,
  slug,
  name,
  imageUrl,
  unitPrice,
  category,
  labels,
  size = "lg",
  className = "",
}: {
  kind: CartItemKind;
  slug: string;
  name: string;
  imageUrl?: string | null;
  unitPrice: number;
  category?: string;
  labels: { add: string; added: string; viewCart: string };
  size?: "md" | "lg";
  className?: string;
}) {
  const { add } = useShopCart();
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function handleAdd() {
    add({ kind, slug, name, imageUrl, unitPrice });
    track({ name: "add_to_cart", item: { id: slug, name, price: unitPrice, quantity: 1, category } });
    setJustAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), 4000);
  }

  const pad = size === "lg" ? "px-6 py-3.5 text-lg" : "px-4 py-2.5 text-base";

  return (
    <span className={`inline-flex flex-wrap items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleAdd}
        className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-button bg-primary-600 font-semibold text-white outline-offset-2 transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 active:scale-[0.98] max-sm:min-h-11 ${pad}`}
      >
        {justAdded ? `✓ ${labels.added}` : labels.add}
      </button>
      {/* Announced to screen readers; stays visible briefly so the shopper
          can jump straight to the cart. */}
      <span aria-live="polite" className="text-sm">
        {justAdded && (
          <Link
            href="/checkout"
            className="rounded-sm font-semibold text-primary-600 underline-offset-4 outline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
          >
            {labels.viewCart} →
          </Link>
        )}
      </span>
    </span>
  );
}
