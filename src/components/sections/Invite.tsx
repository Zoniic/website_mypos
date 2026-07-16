import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";

export function Invite() {
  const t = useTranslations("home.invite");

  return (
    <section className="relative overflow-hidden bg-surface-2 py-20 text-text-1 sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="animate-blob-a absolute left-1/2 top-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-primary-500), transparent 70%)" }}
        />
      </div>
      <FadeIn scale={0.96} className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 text-text-2">{t("description")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/contact" variant="line" size="lg">
            {t("cta")}
          </Button>
        </div>
      </FadeIn>
    </section>
  );
}
