"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CONSENT_EVENT, readConsent, writeConsent, type ConsentValue } from "@/lib/analytics";

/**
 * PDPA cookie banner. "Accept all" turns on analytics and ad pixels;
 * "Necessary only" keeps them off (Google tags stay in consent-denied mode,
 * Meta/TikTok/LINE never load). The footer's "Cookie settings" link
 * reopens it.
 *
 * Always rendered on the server so first-time visitors see it with the rest
 * of the page (it used to pop in after hydration and became the page's late
 * Largest Contentful Paint). Returning visitors never see it: a pre-paint
 * script sets html[data-consent] and CSS hides .consent-banner.
 */
export function CookieConsent() {
  const t = useTranslations("cookieConsent");

  function choose(value: ConsentValue) {
    writeConsent(value);
  }

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="consent-banner fixed inset-x-0 bottom-14 z-50 border-t border-border bg-surface-1 px-4 py-4 shadow-[var(--shadow-xl)] sm:px-6 lg:bottom-0 lg:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-2">
          {t("message")}{" "}
          <Link
            href="/privacy-policy"
            className="rounded-sm underline outline-offset-2 transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
          >
            {t("privacyLink")}
          </Link>
        </p>
        <div className="flex w-full shrink-0 gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => choose("necessary")}
            className="flex-1 rounded-button border border-border-strong bg-white px-4 py-2 text-sm font-semibold text-text-1 outline-offset-2 transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 sm:flex-none"
          >
            {t("necessaryOnly")}
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="flex-1 rounded-button bg-primary-600 px-5 py-2 text-sm font-semibold text-white outline-offset-2 transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 sm:flex-none"
          >
            {t("accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Footer link that reopens the banner. Withdrawing consent reloads the
 * page, because pixels that already loaded can't be unloaded in place.
 */
export function CookieSettingsButton({ label, className = "" }: { label: string; className?: string }) {
  function reopen() {
    const wasAccepted = readConsent() === "accepted";
    writeConsent(null);
    if (wasAccepted) {
      const onChoice = () => {
        if (readConsent() === "necessary") window.location.reload();
        if (readConsent() !== null) window.removeEventListener(CONSENT_EVENT, onChoice);
      };
      window.addEventListener(CONSENT_EVENT, onChoice);
    }
  }

  return (
    <button type="button" onClick={reopen} className={className}>
      {label}
    </button>
  );
}
