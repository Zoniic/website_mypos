"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

const solutionSlugs = ["selfOrder", "weighPay", "pos", "ticketing"] as const;
const solutionHrefs: Record<(typeof solutionSlugs)[number], string> = {
  selfOrder: "/solutions/self-order",
  weighPay: "/solutions/weigh-pay",
  pos: "/solutions/pos",
  ticketing: "/solutions/ticketing",
};

const productCategories = ["self-order", "weigh-pay", "pos", "ticketing"] as const;

const trailingLinks = [
  { key: "references", href: "/references" },
  { key: "software", href: "/software" },
  { key: "knowledgeBase", href: "/knowledge-base" },
  { key: "service", href: "/service" },
  { key: "about", href: "/about" },
] as const;

const navLinkClass =
  "relative py-2 text-sm font-medium text-text-2 hover:text-text-1 after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[image:var(--gradient-primary)] after:transition-transform after:duration-300 hover:after:scale-x-100";

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

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center gap-1">
        {mainHref ? (
          <Link href={mainHref} className={navLinkClass} onClick={onNavigate}>
            {label}
          </Link>
        ) : (
          <button
            type="button"
            className={navLinkClass}
            aria-expanded={open}
            aria-haspopup="true"
            onClick={() => setOpen((o) => !o)}
          >
            {label}
          </button>
        )}
        <button
          type="button"
          className="p-1 text-text-2 hover:text-text-1"
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={`${label} menu`}
          onClick={() => setOpen((o) => !o)}
        >
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
      </div>
      {open && (
        <div className="absolute left-0 top-full w-64 rounded-lg border border-border bg-surface-1 p-2 shadow-lg">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-text-2 transition-all hover:translate-x-1 hover:bg-surface-2 hover:text-text-1"
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
          <NavDropdown label={t("solutions")} items={solutionItems} />
          <NavDropdown label={t("products")} mainHref="/products" items={productCategoryItems} />
          <NavDropdown
            label={t("accessories")}
            mainHref="/accessories"
            items={accessoryCategoryItems}
          />

          {trailingLinks.map((link) => (
            <Link key={link.key} href={link.href} className={navLinkClass}>
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Button href="/contact" variant="primary" size="sm">
            {t("contact")}
          </Button>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-md p-2.5 lg:hidden"
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

          <p className="pt-2 text-sm font-semibold text-text-2">{t("solutions")}</p>
          {solutionItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block py-2.5 pl-3 text-base text-text-2"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/products"
            className="block pt-2 text-base font-medium text-text-1"
            onClick={() => setMobileOpen(false)}
          >
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
