/** Maps a Page Content namespace to the public page it's rendered on, for the admin live preview panel. */
export const NAMESPACE_PREVIEW_PATHS: Record<string, string> = {
  home: "/",
  nav: "/",
  common: "/",
  footer: "/",
  stickyBar: "/",
  cookieConsent: "/",
  about: "/about",
  contact: "/contact",
  software: "/software",
  products: "/products",
  productsCommon: "/products",
  productDetail: "/products",
  accessories: "/accessories",
  references: "/references",
  service: "/service",
  solutions: "/solutions/self-order",
  solutionsCommon: "/solutions/self-order",
  kb: "/knowledge-base",
  legal: "/privacy-policy",
};

export function getPreviewPath(namespace: string): string {
  return NAMESPACE_PREVIEW_PATHS[namespace] ?? "/";
}
