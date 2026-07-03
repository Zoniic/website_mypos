import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

export function Invite() {
  const t = useTranslations("home.invite");

  return (
    <section className="bg-surface-2 py-16 text-text-1">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="mt-4 text-text-2">{t("description")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button href="/contact" variant="line" size="lg">
            {t("cta")}
          </Button>
        </div>
      </div>
    </section>
  );
}
