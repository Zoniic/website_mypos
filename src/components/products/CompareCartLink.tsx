"use client";

import { Columns2 } from "lucide-react";
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
      <Columns2 size={18} strokeWidth={1.75} aria-hidden="true" />
      {items.length > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-semibold text-white">
          {items.length}
        </span>
      )}
    </Link>
  );
}
