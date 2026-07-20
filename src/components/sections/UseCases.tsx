import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeader } from "@/components/ui/SectionHeader";

type UseCaseItem = { type: string; title: string; blurb: string };

// One small line-icon per business type — inline SVG (no icon library/asset
// files needed), same stroke convention as the rest of the icon set
// (currentColor, ~1.4 stroke, 18x18 viewBox).
const businessTypeIcons: Record<string, React.ReactNode> = {
  restaurant: (
    <>
      <path d="M5 2v5a1 1 0 0 1-2 0V2M4 7v9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M13 2c-1.4 0-2 1.3-2 3s.6 3 2 3v8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  retail: (
    <path
      d="M3 3h6l7 7-6 6-7-7V3Z M6.3 6.3h.01"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinejoin="round"
      strokeLinecap="round"
      fill="none"
    />
  ),
  buffet: (
    <path
      d="M3 13h12M4 13a5 5 0 0 1 10 0M9 8V5M7.5 5h3"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  convenience: (
    <path
      d="M3 7l1-4h10l1 4M3 7v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7M3 7h12M8 15v-4h2v4"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  themepark: (
    <>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 3.5v11M3.5 9h11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </>
  ),
  hotel: (
    <path
      d="M3 14.5V5M3 10h12v4.5M6 10V8.3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V10M15 14.5V12"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  cafeteria: (
    <path
      d="M2.5 4.5h13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1ZM5 8h3M5 10.5h5"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  bakery: (
    <path
      d="M3 10.5a6 3 0 0 1 12 0v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-1ZM6 10.5V8M9 10.5V7M12 10.5V8"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  manufacturing: (
    <path
      d="M3 15.5V9l3 2.2V9l3 2.2V9l4-3v9.5H3ZM3 15.5h10M13 6.5V4.5h2v2"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export async function UseCases() {
  const t = await getTranslations("useCases");
  const items = (t.raw("items") as UseCaseItem[]) ?? [];

  if (!items.length) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <SectionHeader eyebrow={t("eyebrow")} title={t("title")} lede={t("lede")} />

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <FadeIn key={item.type} delay={(index % 3) * 0.06}>
            <Link
              href={{ pathname: "/products", query: { businessType: item.type } }}
              className="group flex h-full items-start gap-4 rounded-2xl border border-border bg-surface-1 p-6 transition-all hover:-translate-y-1 hover:border-primary-400/40 hover:shadow-[var(--shadow-card-hover)]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                  {businessTypeIcons[item.type]}
                </svg>
              </span>
              <div className="flex-1">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm text-text-2">{item.blurb}</p>
              </div>
              <span
                aria-hidden
                className="mt-0.5 shrink-0 text-primary-600 transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
