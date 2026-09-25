import type { ReactNode } from "react";
import { FadeIn } from "@/components/ui/FadeIn";

/**
 * Section heading. On wide screens the heading and its lede sit side by side
 * (heading left, lede bottom-aligned right) instead of stacking under a
 * repeated eyebrow label, so sections don't all share one template.
 */
export function SectionHeader({
  title,
  lede,
  align = "left",
  action,
  as: Heading = "h2",
}: {
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  /** Use "h1" when this header is the page's main heading. */
  as?: "h1" | "h2";
}) {
  const heading = (
    <Heading className="font-display text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
      {title}
    </Heading>
  );

  if (align === "center") {
    return (
      <FadeIn className="mx-auto flex max-w-2xl flex-col items-center text-center">
        {heading}
        {lede ? <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-2">{lede}</p> : null}
        {action ? <div className="mt-6">{action}</div> : null}
      </FadeIn>
    );
  }

  return (
    <FadeIn className="grid gap-5 lg:grid-cols-12 lg:items-end lg:gap-10">
      <div className="lg:col-span-7">{heading}</div>
      {lede || action ? (
        <div className="flex flex-col gap-5 lg:col-span-5 lg:items-start lg:pb-1.5">
          {lede ? <p className="max-w-prose text-lg leading-relaxed text-text-2">{lede}</p> : null}
          {action}
        </div>
      ) : null}
    </FadeIn>
  );
}
