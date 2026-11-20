"use client";

import { ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useShopCart } from "@/lib/shopCart";

/** Header cart icon with item count; links to the cart & checkout page. */
export function ShopCartLink({ label, className = "" }: { label: string; className?: string }) {
  const { count, hydrated } = useShopCart();

  return (
    <Link
      href="/checkout"
      // The cart reads browser storage; prefetching its server shell buys nothing.
      prefetch={false}
      aria-label={hydrated && count > 0 ? `${label} (${count})` : label}
      className={`relative rounded-sm p-1.5 text-text-2 outline-offset-2 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 ${className}`}
    >
      <ShoppingCart size={20} strokeWidth={1.75} aria-hidden="true" />
      {hydrated && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
