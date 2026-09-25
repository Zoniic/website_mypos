import { getTranslations } from "next-intl/server";
import { ScrollVelocity } from "@/components/reactbits/ScrollVelocity";

type UseCaseItem = { type: string; title: string };

/**
 * A strip of receipt paper running across an ink band, printed with the
 * business types MYPOS serves. It drifts sideways and picks up speed with
 * the reader's scroll — the one motif on the site only a POS maker would use.
 */
export async function ReceiptTape() {
  const t = await getTranslations("useCases");
  const items = (t.raw("items") as UseCaseItem[]) ?? [];

  if (!items.length) return null;

  return (
    <section aria-label={t("title")} className="overflow-hidden bg-ink py-14 sm:py-20">
      <div className="receipt-paper -mx-4 -rotate-[1.5deg] bg-white py-5 text-text-1 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:py-7">
        <ScrollVelocity baseVelocity={-36} className="gap-6 pr-6 sm:gap-10 sm:pr-10">
          {items.map((item) => (
            <span key={item.type} className="flex items-center gap-6 sm:gap-10">
              <span className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">{item.title}</span>
              <span aria-hidden className="text-2xl text-primary-600 sm:text-4xl">
                ✱
              </span>
            </span>
          ))}
        </ScrollVelocity>
      </div>
    </section>
  );
}
