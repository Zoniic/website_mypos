/**
 * Default menus. The admin can reorder, hide and add links in
 * /admin/navigation; these lists are what the site falls back to (and where
 * links added in code appear from). Labels come from the `nav` messages.
 */
export const defaultResourceLinks = [
  { key: "references", href: "/references" },
  { key: "software", href: "/software" },
  { key: "knowledgeBase", href: "/knowledge-base" },
  { key: "blog", href: "/blog" },
  { key: "service", href: "/service" },
  { key: "savingsCalculator", href: "/tools/savings-calculator" },
];

export const defaultFooterGroups = [
  {
    key: "products",
    items: [
      { key: "products", href: "/products" },
      { key: "accessories", href: "/accessories" },
      { key: "industries", href: "/industries" },
      { key: "savingsCalculator", href: "/tools/savings-calculator" },
      { key: "compare", href: "/compare" },
    ],
  },
  {
    key: "resources",
    items: [
      { key: "references", href: "/references" },
      { key: "software", href: "/software" },
      { key: "knowledgeBase", href: "/knowledge-base" },
      { key: "blog", href: "/blog" },
      { key: "service", href: "/service" },
    ],
  },
  {
    key: "about",
    items: [
      { key: "about", href: "/about" },
      { key: "careers", href: "/careers" },
      { key: "contact", href: "/contact" },
    ],
  },
];
