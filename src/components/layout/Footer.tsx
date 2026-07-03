import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { siteConfig } from "@/config/site";

const menuLinks = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "accessories", href: "/accessories" },
  { key: "references", href: "/references" },
  { key: "software", href: "/software" },
  { key: "service", href: "/service" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-0">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <Image
            src="/images/brand/logo.png"
            alt="MYPOS"
            width={130}
            height={27}
            className="h-7 w-auto"
          />
          <p className="mt-3 text-sm leading-relaxed text-text-2">
            {t("companyDesc")}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-1">
            {t("menuTitle")}
          </h3>
          <ul className="mt-3 space-y-2">
            {menuLinks.map((link) => (
              <li key={link.key}>
                <Link
                  href={link.href}
                  className="text-sm text-text-2 hover:text-text-1"
                >
                  {tNav(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-1">
            {t("contactTitle")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-text-2">
            <li>
              {t("phone")}:{" "}
              <a href={`tel:${siteConfig.phone}`} className="hover:text-text-1">
                {siteConfig.phoneDisplay}
              </a>
            </li>
            <li>
              {t("email")}:{" "}
              <a href={`mailto:${siteConfig.email}`} className="hover:text-text-1">
                {siteConfig.email}
              </a>
            </li>
            <li>{t("address")}</li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-1">
            {t("followTitle")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-text-2">
            <li>
              <a
                href={siteConfig.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-1"
              >
                LINE
              </a>
            </li>
            <li>
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text-1"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-text-2 sm:px-6 lg:px-8">
        © {year} MYPOS. {t("rights")}.
      </div>
    </footer>
  );
}
