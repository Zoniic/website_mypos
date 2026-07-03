/**
 * 301 redirects from the old .php site to the new route structure.
 *
 * TODO(team): replace the EXAMPLE entries below with the real URL list once
 * available (export from Google Search Console > Pages, or the old
 * sitemap.xml). `destination` should NOT include a locale prefix — the
 * i18n proxy adds /th (default) automatically after this redirect fires.
 *
 * For old URLs that used query strings (e.g. product.php?id=123), use the
 * `has` field to match the query key/value, since Next.js redirects can't
 * wildcard-match arbitrary query values.
 */
export type LegacyRedirect = {
  source: string;
  destination: string;
  has?: { type: "query"; key: string; value: string }[];
};

export const legacyRedirects: LegacyRedirect[] = [
  // EXAMPLE — simple page rename:
  // { source: "/about-us.php", destination: "/about" },

  // EXAMPLE — old product catalog page:
  // { source: "/products.php", destination: "/products" },

  // EXAMPLE — old product detail page keyed by query string:
  // {
  //   source: "/product.php",
  //   destination: "/products/f82",
  //   has: [{ type: "query", key: "id", value: "82" }],
  // },
];
