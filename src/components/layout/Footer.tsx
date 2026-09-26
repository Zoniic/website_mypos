import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLogoUrl, getSiteSettings } from "@/lib/siteSettings";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { CookieSettingsButton } from "@/components/layout/CookieConsent";
import { MarketplaceLinks } from "@/components/commerce/MarketplaceLinks";
import { getFooterNav } from "@/lib/navView";

const linkClass =
  "rounded-sm text-sm text-text-2 outline-offset-4 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400";

export async function Footer() {
  const t = await getTranslations("footer");
  const settings = await getSiteSettings();
  // Link groups as arranged in the admin (Navigation → Footer).
  const linkGroups = await getFooterNav(await getLocale());
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-0">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        <div className="lg:col-span-4">
          <Image src={await getLogoUrl()} alt="MYPOS" width={130} height={27} className="h-7 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-2">{t("companyDesc")}</p>
          <MarketplaceLinks
            className="mt-6"
            label={t("shopOn")}
            shopee={settings.shopeeShopUrl}
            lazada={settings.lazadaShopUrl}
            tiktok={settings.tiktokShopUrl}
          />
          <div className="mt-8 max-w-sm">
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

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-8">
          {linkGroups.map((group) => (
            <nav key={group.key} aria-label={group.label}>
              <h3 className="text-sm font-semibold text-text-1">{group.label}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.items.map((link) => (
                  <li key={link.key}>
                    <Link href={link.href} className={linkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-text-1">{t("contactTitle")}</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-text-2">
              {settings.phone && (
                <li>
                  <a href={`tel:${settings.phone}`} className={linkClass}>
                    {settings.phoneDisplay || settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a href={`mailto:${settings.email}`} className={`${linkClass} break-all`}>
                    {settings.email}
                  </a>
                </li>
              )}
              <li>{t("address")}</li>
              {settings.lineUrl && (
                <li>
                  <a href={settings.lineUrl} target="_blank" rel="noopener noreferrer" className={linkClass}>
                    LINE
                  </a>
                </li>
              )}
              {(
                [
                  ["Facebook", settings.facebookUrl],
                  ["YouTube", settings.youtubeUrl],
                  ["TikTok", settings.tiktokUrl],
                  ["Instagram", settings.instagramUrl],
                ] as const
              ).map(
                ([name, url]) =>
                  url && (
                    <li key={name}>
                      <a href={url} target="_blank" rel="noopener noreferrer me" className={linkClass}>
                        {name}
                      </a>
                    </li>
                  )
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-text-2 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} MYPOS. {t("rights")}.
          </p>
          <p className="flex gap-5">
            <Link href="/privacy-policy" className={linkClass.replace("text-sm", "text-xs")}>
              {t("privacyPolicy")}
            </Link>
            <Link href="/terms-of-service" className={linkClass.replace("text-sm", "text-xs")}>
              {t("termsOfService")}
            </Link>
            <CookieSettingsButton label={t("cookieSettings")} className={linkClass.replace("text-sm", "text-xs")} />
          </p>
        </div>
      </div>
    </footer>
  );
}
