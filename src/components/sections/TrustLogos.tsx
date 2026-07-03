import { useTranslations } from "next-intl";

// Real customer names/segments from the MYPOS brochure. Swap for actual
// logo images (with the customer's permission) once available.
const trustNames = [
  "DreamWorld",
  "Ruengrawin Metal",
  "SME Retail Chain",
  "F&B Chain",
  "Convenience Store",
  "Restaurant Group",
];

export function TrustLogos() {
  const t = useTranslations("home.trust");

  return (
    <section className="border-y border-border bg-surface-0 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-text-2">
          {t("title")}
        </p>
        <div className="mt-6 grid grid-cols-3 gap-6 sm:grid-cols-6">
          {trustNames.map((name) => (
            <div
              key={name}
              className="flex h-12 items-center justify-center rounded-md bg-surface-2 px-2 text-center text-xs font-medium text-text-2"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
