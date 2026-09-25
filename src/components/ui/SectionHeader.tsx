import type { ReactNode } from "react";
import { FadeIn } from "@/components/ui/FadeIn";

/**
 * Editorial section header: a short eyebrow label + hairline rule sits above an
 * oversized display heading. The eyebrow is real, translatable copy (e.g.
 * "โซลูชันของเรา") — it names the section, unlike a decorative index number,
 * which would falsely imply the home sections are an ordered sequence.
 */
export function SectionHeader({
  eyebrow,
  title,
  lede,
  align = "left",
  action,
  as: Heading = "h2",
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  /** Use "h1" when this header is the page's main heading. */
  as?: "h1" | "h2";
}) {
  const isCenter = align === "center";

  return (
    <FadeIn
      className={
        isCenter
          ? "mx-auto flex max-w-2xl flex-col items-center text-center"
          : "flex flex-col"
      }
    >
      <div
        className={`flex items-center gap-3 ${isCenter ? "justify-center" : ""}`}
      >
        <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
          {eyebrow}
        </span>
        <span aria-hidden className="h-px w-10 bg-border-strong" />
      </div>

      <div
        className={`mt-4 flex w-full flex-wrap items-end gap-x-8 gap-y-4 ${
          isCenter ? "justify-center" : "justify-between"
        }`}
      >
        <Heading className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {title}
        </Heading>
        {action ? <div className="shrink-0 pb-1.5">{action}</div> : null}
      </div>

      {lede ? (
        <p
          className={`mt-5 text-lg leading-relaxed text-text-2 ${
            isCenter ? "max-w-xl" : "max-w-2xl"
          }`}
        >
          {lede}
        </p>
      ) : null}
    </FadeIn>
  );
}
