import Image from "next/image";

type Ratio = "16/9" | "1/1" | "4/3" | "3/4" | "21/9";

const ratioClass: Record<Ratio, string> = {
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "21/9": "aspect-[21/9]",
};

export function PlaceholderImage({
  ratio = "4/3",
  label,
  className,
  src,
}: {
  ratio?: Ratio;
  label: string;
  className?: string;
  /** Real uploaded photo URL. Falls back to a placeholder tile when unset. */
  src?: string;
}) {
  if (src) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl bg-surface-2 ${ratioClass[ratio]} ${className ?? ""}`}
      >
        <Image src={src} alt={label} fill className="object-cover" />
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
        className="object-cover opacity-60"
      />
      <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs font-medium text-text-2">
        {label}
      </span>
    </div>
  );
}
