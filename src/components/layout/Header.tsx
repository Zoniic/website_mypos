"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { CompareCartLink } from "@/components/products/CompareCartLink";

const solutionSlugs = ["selfOrder", "weighPay", "pos", "ticketing"] as const;
const solutionHrefs: Record<(typeof solutionSlugs)[number], string> = {
  selfOrder: "/solutions/self-order",
  weighPay: "/solutions/weigh-pay",
  pos: "/solutions/pos",
  ticketing: "/solutions/ticketing",
};

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
] as const;

const trailingLinks = [{ key: "about", href: "/about" }] as const;

const navLinkClass =
  "relative rounded-sm py-2 text-sm font-medium text-text-2 outline-offset-4 hover:text-text-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[image:var(--gradient-primary)] after:transition-transform after:duration-300 hover:after:scale-x-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400";

type DropdownItem = { key: string; label: string; href: string };

function NavDropdown({
  label,
  mainHref,
  items,
  onNavigate,
}: {
  label: string;
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
          className={`flex items-center gap-1 ${navLinkClass}`}
          aria-haspopup="true"
          aria-expanded={open}
          onClick={onNavigate}
        >
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
          className={`flex cursor-pointer items-center gap-1 ${navLinkClass}`}
          aria-expanded={open}
          aria-haspopup="true"
          onClick={() => setOpen((o) => !o)}
        >
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

// "Products" absorbs Solutions (use-case bundles) as a second column instead
// of claiming its own top-level nav slot — they're both entry points into
// the same product catalog, just sliced two different ways.
function ProductsMegaMenu({
  label,
  useCaseLabel,
  categoryLabel,
  viewAllLabel,
  useCaseItems,
  categoryItems,
  onNavigate,
}: {
  label: string;
  useCaseLabel: string;
  categoryLabel: string;
  viewAllLabel: string;
  useCaseItems: DropdownItem[];
  categoryItems: DropdownItem[];
  onNavigate?: () => void;
}) {
  const { open, rootRef, rootProps } = useDropdown();

  return (
    <div ref={rootRef} className="relative" {...rootProps}>
      <Link
        href="/products"
        className={`flex items-center gap-1 ${navLinkClass}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={onNavigate}
      >
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
      {open && (
        <div className="absolute left-0 top-full flex w-[30rem] gap-6 rounded-lg border border-border bg-surface-1 p-4 shadow-lg">
          <div className="flex-1">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-text-2">
              {useCaseLabel}
            </p>
            {useCaseItems.map((item) => (
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
          <div className="flex-1 border-l border-border pl-4">
            <p className="px-3 text-xs font-semibold uppercase tracking-wide text-text-2">
              {categoryLabel}
            </p>
            {categoryItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm text-text-2 outline-offset-2 transition-all hover:translate-x-1 hover:bg-surface-2 hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
                onClick={onNavigate}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/products"
              className="mt-1 block rounded-md px-3 py-2 text-sm font-semibold text-primary-300 outline-offset-2 transition-all hover:translate-x-1 hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              onClick={onNavigate}
            >
              {viewAllLabel}
            </Link>
          </div>
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

  const solutionItems: DropdownItem[] = solutionSlugs.map((slug) => ({
    key: slug,
    label: t(`solutionsItems.${slug}`),
    href: solutionHrefs[slug],
  }));

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
          <ProductsMegaMenu
            label={t("products")}
            useCaseLabel={t("byUseCase")}
            categoryLabel={t("byCategory")}
            viewAllLabel={t("viewAllProducts")}
            useCaseItems={solutionItems}
            categoryItems={productCategoryItems}
          />
          <NavDropdown
            label={t("accessories")}
            mainHref="/accessories"
            items={accessoryCategoryItems}
          />
          <NavDropdown label={t("resources")} items={resourceItems} />

          {trailingLinks.map((link) => (
            <Link key={link.key} href={link.href} className={navLinkClass}>
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
            className="block pt-2 text-base font-medium text-text-1"
            onClick={() => setMobileOpen(false)}
          >
            {t("products")}
          </Link>
          <p className="pt-2 pl-3 text-xs font-semibold uppercase tracking-wide text-text-2">
            {t("byUseCase")}
          </p>
          {solutionItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block py-2.5 pl-3 text-sm text-text-2"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <p className="pt-2 pl-3 text-xs font-semibold uppercase tracking-wide text-text-2">
            {t("byCategory")}
          </p>
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
            className="block pt-2 text-base font-medium text-text-1"
            onClick={() => setMobileOpen(false)}
          >
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

          <p className="pt-2 text-sm font-semibold text-text-2">{t("resources")}</p>
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
              className="block py-2.5 text-base font-medium text-text-1"
              onClick={() => setMobileOpen(false)}
            >
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
