"use client";

import { useTranslations } from "next-intl";
import { FaqAccordion, type FaqItem } from "@/components/sections/FaqAccordion";

export function Faq() {
  const t = useTranslations("home.faq");
  const items = t.raw("items") as FaqItem[];

  return <FaqAccordion title={t("title")} items={items} />;
}
