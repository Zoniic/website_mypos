"use client";

import { Link } from "@/i18n/navigation";
import { useQuoteCart } from "@/lib/quoteCart";

export function CompareCartLink({ label, className }: { label: string; className?: string }) {
  const { items } = useQuoteCart();

  return (
    <Link
      href="/compare"
      aria-label={label}
      className={`relative rounded-sm p-1.5 text-text-2 outline-offset-2 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 ${className ?? ""}`}
    >
      {/* Two side-by-side columns: "compare", distinct from the shopping cart icon. */}
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2.75" y="3.75" width="5.5" height="12.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11.75" y="3.75" width="5.5" height="12.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {items.length > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-semibold text-white">
          {items.length}
        </span>
      )}
    </Link>
  );
}
