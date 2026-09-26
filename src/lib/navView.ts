import { getTranslations } from "next-intl/server";
import { customLabel, getSiteStructure, visibleMenu, type NavItem } from "@/lib/siteStructure";

export type NavLinkView = { key: string; label: string; href: string };
export type NavGroupView = { key: string; label: string; items: NavLinkView[] };

export type HeaderNav = {
  solutions: NavGroupView[];
  /** Product categories; the header builds the /products and /accessories links. */
  categories: { key: string; label: string }[];
  industries: NavLinkView[];
  resources: NavLinkView[];
};

/** Menus as the admin arranged them, with labels in the visitor's language. */
export async function getHeaderNav(locale: string): Promise<HeaderNav> {
  const { menus } = await getSiteStructure();
  const t = await getTranslations({ locale, namespace: "nav" });
  const tp = await getTranslations({ locale, namespace: "productsCommon" });
  const view = (item: NavItem, builtIn: () => string): NavLinkView => ({
    key: item.key,
    href: item.href,
    label: customLabel(item, locale) ?? builtIn(),
  });
  const firstGroup = (key: keyof typeof menus) => visibleMenu(menus[key])[0]?.items ?? [];

  return {
    solutions: visibleMenu(menus["nav.solutions"]).map((g) => ({
      key: g.key,
      label: t(`solutionsGroups.${g.key}`),
      items: g.items.map((i) => view(i, () => t(`solutionsItems.${i.key}`))),
    })),
    categories: firstGroup("nav.categories").map((i) => ({ key: i.key, label: tp(`categories.${i.key}`) })),
    industries: firstGroup("nav.industries").map((i) => view(i, () => tp(`businessTypes.${i.key}`))),
    resources: firstGroup("nav.resources").map((i) => view(i, () => t(i.key))),
  };
}

export async function getFooterNav(locale: string): Promise<NavGroupView[]> {
  const { menus } = await getSiteStructure();
  const t = await getTranslations({ locale, namespace: "nav" });
  return visibleMenu(menus["nav.footer"]).map((g) => ({
    key: g.key,
    label: t(g.key),
    items: g.items.map((i) => ({ key: i.key, href: i.href, label: customLabel(i, locale) ?? t(i.key) })),
  }));
}
