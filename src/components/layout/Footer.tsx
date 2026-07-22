import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteSettings } from "@/lib/siteSettings";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

const menuLinks = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "accessories", href: "/accessories" },
  { key: "references", href: "/references" },
  { key: "software", href: "/software" },
  { key: "knowledgeBase", href: "/knowledge-base" },
  { key: "blog", href: "/blog" },
  { key: "service", href: "/service" },
  { key: "about", href: "/about" },
  { key: "careers", href: "/careers" },
  { key: "contact", href: "/contact" },
] as const;

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const settings = await getSiteSettings();
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
                  className="rounded-sm text-sm text-text-2 outline-offset-4 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
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
              <a
                href={`tel:${settings.phone}`}
                className="rounded-sm outline-offset-4 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              >
                {settings.phoneDisplay}
              </a>
            </li>
            <li>
              {t("email")}:{" "}
              <a
                href={`mailto:${settings.email}`}
                className="rounded-sm outline-offset-4 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              >
                {settings.email}
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
                href={settings.lineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm outline-offset-4 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              >
                LINE
              </a>
            </li>
            <li>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm outline-offset-4 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md">
          <NewsletterForm
            title={t("newsletterTitle")}
            placeholder={t("newsletterPlaceholder")}
            submitLabel={t("newsletterSubmit")}
            successMessage={t("newsletterSuccess")}
            alreadyMessage={t("newsletterAlready")}
            invalidMessage={t("newsletterInvalid")}
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 border-t border-border px-4 py-4 text-center text-xs text-text-2 sm:px-6 lg:px-8">
        <p>
          © {year} MYPOS. {t("rights")}.
        </p>
        <p className="flex gap-4">
          <Link
            href="/privacy-policy"
            className="rounded-sm outline-offset-4 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
          >
            {t("privacyPolicy")}
          </Link>
          <Link
            href="/terms-of-service"
            className="rounded-sm outline-offset-4 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
          >
            {t("termsOfService")}
          </Link>
        </p>
      </div>
    </footer>
  );
}
