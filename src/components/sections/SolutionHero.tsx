import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { FadeIn } from "@/components/ui/FadeIn";
import type { MachineKind } from "@/components/ui/MachineArt";

export function SolutionHero({
  eyebrow,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  ctaPrimaryHref = "/contact",
  ctaSecondaryHref = "#compare",
  imageLabel,
  imageUrl,
  imageSlot,
  machine,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  ctaPrimaryHref?: string;
  ctaSecondaryHref?: string;
  imageLabel: string;
  imageUrl?: string;
  /** Site Photos slot of the hero photo (edit-on-site mode). */
  imageSlot?: string;
  machine?: MachineKind;
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8 lg:px-8 lg:py-14">
      <FadeIn className="lg:col-span-6">
        <p className="text-sm font-semibold text-primary-600">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-text-2">{subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={ctaPrimaryHref} variant="primary" size="lg">
            {ctaPrimary}
          </Button>
          <Button href={ctaSecondaryHref} variant="ghost" size="lg">
            {ctaSecondary}
          </Button>
        </div>
      </FadeIn>
      <FadeIn delay={0.1} className="lg:col-span-6">
        <PlaceholderImage
          ratio="4/3"
          label={imageLabel}
          src={imageUrl}
          slot={imageSlot}
          machine={machine}
          tone="ember"
          className="!rounded-[28px]"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </FadeIn>
    </section>
  );
}
