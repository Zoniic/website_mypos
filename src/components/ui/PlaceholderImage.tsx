import Image from "next/image";

type Ratio = "16/9" | "16/10" | "1/1" | "4/3" | "3/4" | "21/9";

const ratioClass: Record<Ratio, string> = {
  "16/9": "aspect-[16/9]",
  "16/10": "aspect-[16/10]",
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "21/9": "aspect-[21/9]",
};

const DEFAULT_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

export function PlaceholderImage({
  ratio = "4/3",
  label,
  className,
  src,
  sizes = DEFAULT_SIZES,
}: {
  ratio?: Ratio;
  label: string;
  className?: string;
  /** Real uploaded photo URL. Falls back to a placeholder tile when unset. */
  src?: string;
  /** Override when this image isn't in a typical 2-4 column grid (e.g. a full-width hero). */
  sizes?: string;
}) {
  if (src) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-surface-2 ${ratioClass[ratio]} ${className ?? ""}`}
      >
        <Image src={src} alt={label} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-surface-2 ${ratioClass[ratio]} ${className ?? ""}`}
    >
      <Image
        src="/images/placeholders/tile.svg"
        alt=""
        fill
        sizes={sizes}
        className="object-cover opacity-60"
      />
      <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs font-medium text-text-2">
        {label}
      </span>
    </div>
  );
}
