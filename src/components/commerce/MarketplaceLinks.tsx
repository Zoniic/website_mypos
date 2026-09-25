const MARKETPLACES = [
  { key: "shopee", name: "Shopee", color: "#ee4d2d" },
  { key: "lazada", name: "Lazada", color: "#0f136d" },
  { key: "tiktok", name: "TikTok Shop", color: "#111318" },
] as const;

type MarketplaceKey = (typeof MARKETPLACES)[number]["key"];

/**
 * Links to the MYPOS shop (or one listing) on each marketplace. Each link
 * carries its marketplace's own brand colour as a small mark, so shoppers
 * recognise where they're going. Clicks are tracked site-wide by
 * TrackingScripts (it watches for Shopee/Lazada/TikTok hrefs).
 */
export function MarketplaceLinks({
  label,
  itemName,
  size = "sm",
  className = "",
  ...urls
}: {
  /** Heading/prefix, e.g. "ช้อปกับเราได้ที่" or "ซื้อผ่าน". */
  label: string;
  /** Product name, sent with the click event. */
  itemName?: string;
  size?: "sm" | "lg";
  className?: string;
} & Partial<Record<MarketplaceKey, string | null | undefined>>) {
  const links = MARKETPLACES.filter((m) => urls[m.key]);
  if (!links.length) return null;

  const linkClass =
    size === "lg"
      ? "inline-flex items-center gap-2.5 rounded-button border border-border-strong bg-white px-4 py-3 text-base font-semibold text-text-1"
      : "inline-flex items-center gap-2 rounded-full border border-border-strong bg-white px-3 py-1.5 text-sm font-medium text-text-1";

  return (
    <div className={className}>
      <p className={size === "lg" ? "text-sm font-medium text-text-2" : "text-sm font-semibold text-text-1"}>{label}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {links.map((m) => (
          <li key={m.key}>
            <a
              href={urls[m.key]!}
              target="_blank"
              rel="noopener noreferrer"
              data-item-name={itemName}
              className={`${linkClass} outline-offset-2 transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400`}
            >
              <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
              {m.name}
              <span aria-hidden className="text-text-3">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
