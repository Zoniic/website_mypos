import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/ui/FadeIn";

/**
 * Qualitative trust strip — manufacturer strengths that build credibility
 * without depending on customer-count. Used in place of a "500+ shops" style
 * stat while the install base is still small.
 */
export async function TrustStrip() {
  const t = await getTranslations("trust");
  const points = t.raw("points") as string[];

  if (!points?.length) return null;

  return (
    <section className="border-b border-border bg-surface-0">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden bg-border sm:grid-cols-4">
        {points.map((point, index) => (
          <FadeIn key={point} delay={index * 0.06}>
            <div className="flex h-full items-center gap-3 bg-surface-0 px-5 py-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
                  <path
                    d="M4 10.5l3.5 3.5L16 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm font-medium text-text-1">{point}</span>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
