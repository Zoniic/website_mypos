"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { CompareCartLink } from "@/components/products/CompareCartLink";
import { industrySlugs } from "@/data/industries";

/** Shared open/close behavior for header dropdowns: hover or focus opens,
 * outside click/blur or Escape closes. */
function useDropdown() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return {
    open,
    setOpen,
    rootRef,
    rootProps: {
      onMouseEnter: () => setOpen(true),
      onMouseLeave: () => setOpen(false),
      onFocus: () => setOpen(true),
      onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      },
    },
  };
}

const productCategories = ["self-order", "weigh-pay", "pos", "ticketing"] as const;

// Lower-traffic content pages, grouped under one "Resources" menu instead of
// each claiming a top-level nav slot.
const resourceLinks = [
  { key: "references", href: "/references" },
  { key: "software", href: "/software" },
  { key: "knowledgeBase", href: "/knowledge-base" },
  { key: "blog", href: "/blog" },
  { key: "service", href: "/service" },
  { key: "savingsCalculator", href: "/tools/savings-calculator" },
] as const;

const trailingLinks = [{ key: "about", href: "/about" }] as const;

/** Small line-icons for the top-level nav labels — inline so no icon library
 * or asset files are needed; same stroke convention as the feature icons on
 * the homepage (currentColor, ~1.4 stroke). */
function NavIcon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {children}
    </svg>
  );
}

const navIcons: Record<
  "products" | "accessories" | "industries" | "resources" | "about",
  React.ReactNode
> = {
  // Shopping bag.
  products: (
    <NavIcon>
      <path
        d="M5 6h8l-.6 8.4a1 1 0 0 1-1 .9H6.6a1 1 0 0 1-1-.9L5 6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M6.5 6V5a2.5 2.5 0 0 1 5 0v1" stroke="currentColor" strokeWidth="1.4" />
    </NavIcon>
  ),
  // Plug — accessories connect to the core hardware.
  accessories: (
    <NavIcon>
      <path
        d="M4.5 6.5h9v2.5a3.5 3.5 0 0 1-3.5 3.5h-2a3.5 3.5 0 0 1-3.5-3.5V6.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M6 2.5v4M9 12.5v3M12 2.5v4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </NavIcon>
  ),
  // Storefront — business types we build for.
  industries: (
    <NavIcon>
      <path
        d="M3 7.5 4 3h10l1 4.5M3 7.5v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7M3 7.5h12M7.5 15.5V11h3v4.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </NavIcon>
  ),
  // Document — resources/articles/service info.
  resources: (
    <NavIcon>
      <path
        d="M6 2.5h4l3 3v9.5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-11.5a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M10 2.5v3h3M6.5 9h5M6.5 11.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </NavIcon>
  ),
  // Info circle — the company / about us.
  about: (
    <NavIcon>
      <circle cx="9" cy="9" r="6.25" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 8.2v4M9 5.6h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </NavIcon>
  ),
};

const navLinkClass =
  "relative rounded-sm py-2 text-sm font-medium text-text-2 outline-offset-4 hover:text-text-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[image:var(--gradient-primary)] after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400";

type DropdownItem = { key: string; label: string; href: string };

function NavDropdown({
  label,
  icon,
  mainHref,
  items,
  onNavigate,
}: {
  label: string;
  icon?: React.ReactNode;
  /** Omit if there's no standalone index page for this section. */
  mainHref?: string;
  items: DropdownItem[];
  onNavigate?: () => void;
}) {
  const { open, setOpen, rootRef, rootProps } = useDropdown();

  return (
    <div ref={rootRef} className="relative" {...rootProps}>
      {mainHref ? (
        // Single focusable trigger: click navigates to the index page (like any
        // other nav link); hover or keyboard focus reveals the category
        // shortcuts below without a second tab stop just for the chevron.
        <Link
          href={mainHref}
          className={`flex items-center gap-1.5 ${navLinkClass}`}
          aria-haspopup="true"
          aria-expanded={open}
          onClick={onNavigate}
        >
          {icon}
          {label}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden="true"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M1 3l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.5" />
          </svg>
        </Link>
      ) : (
        <button
          type="button"
          className={`flex cursor-pointer items-center gap-1.5 ${navLinkClass}`}
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpen((o) => !o)}
        >
          {icon}
          {label}
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            aria-hidden="true"
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          >
            <path d="M1 3l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.5" />
          </svg>
        </button>
      )}
      {open && (
        <div className="absolute left-0 top-full w-64 rounded-lg border border-border bg-surface-1 p-2 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-text-2 outline-offset-2 transition-all hover:translate-x-1 hover:bg-surface-2 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tProducts = useTranslations("productsCommon");
  const [mobileOpen, setMobileOpen] = useState(false);

  const productCategoryItems: DropdownItem[] = productCategories.map((category) => ({
    key: category,
    label: tProducts(`categories.${category}`),
    href: `/products?category=${category}`,
  }));

  const accessoryCategoryItems: DropdownItem[] = productCategories.map((category) => ({
    key: category,
    label: tProducts(`categories.${category}`),
    href: `/accessories?category=${category}`,
  }));

  const industryItems: DropdownItem[] = industrySlugs.map((type) => ({
    key: type,
    label: tProducts(`businessTypes.${type}`),
    href: `/industries/${type}`,
  }));

  const resourceItems: DropdownItem[] = resourceLinks.map((link) => ({
    key: link.key,
    label: t(link.key),
    href: link.href,
  }));

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface-2 focus:px-4 focus:py-2 focus:text-text-1"
      >
        {tCommon("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center transition-transform hover:scale-105">
          <Image
            src="/images/brand/logo.png"
            alt="MYPOS"
            width={130}
            height={27}
            className="h-7 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
          <NavDropdown
            label={t("products")}
            icon={navIcons.products}
            mainHref="/products"
            items={productCategoryItems}
          />
          <NavDropdown
            label={t("accessories")}
            icon={navIcons.accessories}
            mainHref="/accessories"
            items={accessoryCategoryItems}
          />
          <NavDropdown
            label={t("industries")}
            icon={navIcons.industries}
            mainHref="/industries"
            items={industryItems}
          />
          <NavDropdown label={t("resources")} icon={navIcons.resources} items={resourceItems} />

          {trailingLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={`flex items-center gap-1.5 ${navLinkClass}`}
            >
              {navIcons[link.key as keyof typeof navIcons]}
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/search"
            aria-label={t("search")}
            className="rounded-sm p-1.5 text-text-2 outline-offset-2 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M18 18l-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </Link>
          <CompareCartLink label={t("compare")} />
          <LanguageSwitcher />
          <Button href="/contact" variant="primary" size="sm">
            {t("contact")}
          </Button>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md p-2.5 outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 lg:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            {mobileOpen ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.75"
                fill="none"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.75"
                fill="none"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav
          className="border-t border-border px-4 pb-6 pt-2 lg:hidden"
          aria-label="Primary mobile"
        >
          <Link
            href="/"
            className="block py-2.5 text-base font-medium text-text-1"
            onClick={() => setMobileOpen(false)}
          >
            {t("home")}
          </Link>

          <Link
            href="/products"
            className="flex items-center gap-1.5 pt-2 text-base font-medium text-text-1"
            onClick={() => setMobileOpen(false)}
          >
            {navIcons.products}
            {t("products")}
          </Link>
          {productCategoryItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block py-2.5 pl-3 text-sm text-text-2"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/accessories"
            className="flex items-center gap-1.5 pt-2 text-base font-medium text-text-1"
            onClick={() => setMobileOpen(false)}
          >
            {navIcons.accessories}
            {t("accessories")}
          </Link>
          {accessoryCategoryItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block py-2.5 pl-3 text-sm text-text-2"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/industries"
            className="flex items-center gap-1.5 pt-2 text-base font-medium text-text-1"
            onClick={() => setMobileOpen(false)}
          >
            {navIcons.industries}
            {t("industries")}
          </Link>
          {industryItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block py-2.5 pl-3 text-sm text-text-2"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <p className="flex items-center gap-1.5 pt-2 text-sm font-semibold text-text-2">
            {navIcons.resources}
            {t("resources")}
          </p>
          {resourceItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block py-2.5 pl-3 text-base text-text-2"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {trailingLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="flex items-center gap-1.5 py-2.5 text-base font-medium text-text-1"
              onClick={() => setMobileOpen(false)}
            >
              {navIcons[link.key as keyof typeof navIcons]}
              {t(link.key)}
            </Link>
          ))}

          <Link
            href="/search"
            className="block py-2.5 text-base font-medium text-text-1"
            onClick={() => setMobileOpen(false)}
          >
            {t("search")}
          </Link>
          <Link
            href="/compare"
            className="block py-2.5 text-base font-medium text-text-1"
            onClick={() => setMobileOpen(false)}
          >
            {t("compare")}
          </Link>

          <div className="mt-4 flex items-center justify-between gap-3">
            <LanguageSwitcher />
          </div>
          <Button href="/contact" variant="primary" className="mt-4 w-full">
            {t("contact")}
          </Button>
        </nav>
      )}
    </header>
  );
}
