"use client";

import { MessageSquare, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LineIcon } from "@/components/ui/BrandIcons";

export function StickyMobileBar({ phone, lineUrl }: { phone: string; lineUrl: string }) {
  const t = useTranslations("stickyBar");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface-1 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] lg:hidden">
      <a
        href={`tel:${phone}`}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium text-text-2 outline-offset-[-2px] transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
      >
        <Phone size={20} strokeWidth={1.75} aria-hidden="true" />
        {t("call")}
      </a>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 border-x border-border bg-emerald-700 py-2.5 text-xs font-medium text-white transition-colors hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-white"
      >
        <LineIcon size={20} />
        {t("line")}
      </a>
      <Link
        href="/contact"
        className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium text-text-2 outline-offset-[-2px] transition-colors hover:text-text-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
      >
        <MessageSquare size={20} strokeWidth={1.75} aria-hidden="true" />
        {t("quote")}
      </Link>
    </div>
  );
}
