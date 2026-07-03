"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "mypos-cookie-consent";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === null;
}

// Always "not visible yet" on the server — avoids a hydration mismatch;
// useSyncExternalStore re-syncs to the real client value right after mount.
function getServerSnapshot() {
  return false;
}

export function CookieConsent() {
  const t = useTranslations("cookieConsent");
  const visible = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function accept() {
    window.localStorage.setItem(STORAGE_KEY, "accepted");
    window.dispatchEvent(new Event("storage"));
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t("title")}
      className="fixed inset-x-0 bottom-14 z-50 border-t border-border bg-surface-1 px-4 py-4 shadow-[var(--shadow-xl)] sm:px-6 lg:bottom-0 lg:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-text-2">
          {t("message")}{" "}
          <Link href="/privacy-policy" className="underline hover:text-text-1">
            {t("privacyLink")}
          </Link>
        </p>
        <button
          type="button"
          onClick={accept}
          className="w-full shrink-0 rounded-button bg-[image:var(--gradient-primary)] px-5 py-2 text-sm font-semibold text-text-1 shadow-[var(--shadow-glow-primary)] hover:brightness-110 sm:w-auto"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
