import type { StockStatus } from "@/lib/products";

const styles: Record<StockStatus, string> = {
  in_stock: "bg-success/10 text-success",
  preorder: "bg-primary-400/10 text-primary-600",
  out_of_stock: "bg-surface-2 text-text-2",
};

export function StockBadge({
  status,
  leadTimeDays,
  labels,
}: {
  status: StockStatus;
  leadTimeDays?: number;
  labels: { inStock: string; preorder: string; outOfStock: string; leadTime: string };
}) {
  const text =
    status === "in_stock"
      ? labels.inStock
      : status === "preorder"
        ? labels.preorder
        : labels.outOfStock;

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>
        {text}
      </span>
      {status !== "in_stock" && leadTimeDays ? (
        <span className="text-xs text-text-2">{labels.leadTime.replace("{days}", String(leadTimeDays))}</span>
      ) : null}
    </span>
  );
}
