"use client";

import { useState } from "react";
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

const primaryLinks = [
  { key: "products", href: "/products" },
  { key: "accessories", href: "/accessories" },
  { key: "references", href: "/references" },
  { key: "software", href: "/software" },
  { key: "service", href: "/service" },
  { key: "about", href: "/about" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-surface-2 focus:px-4 focus:py-2 focus:text-text-1"
      >
        {tCommon("skipToContent")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/brand/logo.png"
            alt="MYPOS"
            width={130}
            height={27}
            className="h-7 w-auto"
            priority
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          <div
            className="relative"
            onMouseEnter={() => setSolutionsOpen(true)}
            onMouseLeave={() => setSolutionsOpen(false)}
          >
            <button
              type="button"
              className="flex items-center gap-1 py-2 text-sm font-medium text-text-2 hover:text-text-1"
              aria-expanded={solutionsOpen}
              onClick={() => setSolutionsOpen((open) => !open)}
            >
              {t("solutions")}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                aria-hidden="true"
                className={`transition-transform ${solutionsOpen ? "rotate-180" : ""}`}
              >
                <path d="M1 3l4 4 4-4" stroke="currentColor" fill="none" strokeWidth="1.5" />
              </svg>
            </button>
            {solutionsOpen && (
              <div className="absolute left-0 top-full w-64 rounded-lg border border-border bg-surface-1 p-2 shadow-lg">
                {solutionSlugs.map((slug) => (
                  <Link
                    key={slug}
                    href={solutionHrefs[slug]}
                    className="block rounded-md px-3 py-2 text-sm text-text-2 hover:bg-surface-2"
                  >
                    {t(`solutionsItems.${slug}`)}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {primaryLinks.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="py-2 text-sm font-medium text-text-2 hover:text-text-1"
            >
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

          <p className="pt-2 text-sm font-semibold text-text-2">
            {t("solutions")}
          </p>
          {solutionSlugs.map((slug) => (
            <Link
              key={slug}
              href={solutionHrefs[slug]}
              className="block py-2.5 pl-3 text-base text-text-2"
              onClick={() => setMobileOpen(false)}
            >
              {t(`solutionsItems.${slug}`)}
            </Link>
          ))}

          {primaryLinks.map((link) => (
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
