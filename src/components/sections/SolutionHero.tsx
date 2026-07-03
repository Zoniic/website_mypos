import { Button } from "@/components/ui/Button";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function SolutionHero({
  eyebrow,
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  imageLabel,
  imageUrl,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
  imageLabel: string;
  imageUrl?: string;
}) {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-16 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-text-2">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 text-lg text-text-2">{subtitle}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="/contact" variant="primary" size="lg">
            {ctaPrimary}
          </Button>
          <Button href="#compare" variant="ghost" size="lg">
            {ctaSecondary}
          </Button>
        </div>
      </div>
      <PlaceholderImage ratio="4/3" label={imageLabel} src={imageUrl} />
    </section>
  );
}
