"use client";

import { ClipboardList } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useQuoteCart } from "@/lib/quoteCart";

/**
 * Header link to the compare / quote list (/compare), not the shopping cart
 * (that one is ShopCartLink, a cart icon, shown only when online ordering is on).
 *
 * - `label`: full name, used for the tooltip and screen readers.
 * - `shortLabel`: visible text next to the icon from the xl breakpoint (1280 px);
 *   narrower screens show the icon and the count only.
 * - `hideWhenEmpty`: for the mobile bar, where the link appears only once a model is in the list.
 */
export function CompareCartLink({
  label,
  shortLabel,
  hideWhenEmpty = false,
  className,
}: {
  label: string;
  shortLabel?: string;
  hideWhenEmpty?: boolean;
  className?: string;
}) {
  const { items } = useQuoteCart();
  const count = items.length;
  if (hideWhenEmpty && count === 0) return null;

  return (
    <Link
      href="/compare"
      aria-label={count > 0 ? `${label} (${count})` : label}
      title={label}
      className={`inline-flex items-center gap-1.5 rounded-md p-1.5 text-text-2 outline-offset-2 transition-colors hover:bg-surface-2 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 ${shortLabel ? "xl:px-2.5" : ""} ${className ?? ""}`}
    >
      <span className="relative inline-flex">
        <ClipboardList size={18} strokeWidth={1.75} aria-hidden="true" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white"
          >
            {count}
          </span>
        )}
      </span>
      {shortLabel && <span className="hidden text-sm font-medium xl:inline">{shortLabel}</span>}
    </Link>
  );
}
