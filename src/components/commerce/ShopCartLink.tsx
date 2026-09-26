"use client";

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
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path
          d="M3 4h2l1.2 9.6a1.5 1.5 0 001.5 1.4h6.6a1.5 1.5 0 001.5-1.3L17 7H5.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="8" cy="18" r="1" fill="currentColor" />
        <circle cx="14" cy="18" r="1" fill="currentColor" />
      </svg>
      {hydrated && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
