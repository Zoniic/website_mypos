"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function StickyMobileBar({ phone, lineUrl }: { phone: string; lineUrl: string }) {
  const t = useTranslations("stickyBar");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface-1 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] lg:hidden">
      <a
        href={`tel:${phone}`}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium text-text-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M6.6 10.8c1.3 2.6 3.4 4.7 6 6l2-2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-2 2z"
            fill="currentColor"
          />
        </svg>
        {t("call")}
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 border-x border-border bg-emerald-700 py-2.5 text-xs font-medium text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.6 7.2 8.4 7.9.3.1.8.3.9.6.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5 1.1-.4 5.7-3.4 7.8-5.8C21.2 14.2 22 12.7 22 11c0-4.4-4.5-8-10-8z"
            fill="currentColor"
          />
        </svg>
        {t("line")}
      </a>
      <Link
        href="/contact"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium text-text-2"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 4h16v12H7l-3 3V4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
        {t("quote")}
      </Link>
    </div>
  );
}
