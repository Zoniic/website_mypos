import Image from "next/image";
import { MachineArt, type MachineKind } from "@/components/ui/MachineArt";

type Ratio = "16/9" | "16/10" | "1/1" | "4/3" | "3/4" | "21/9";

const ratioClass: Record<Ratio, string> = {
  "16/9": "aspect-[16/9]",
  "16/10": "aspect-[16/10]",
  "1/1": "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/4": "aspect-[3/4]",
  "21/9": "aspect-[21/9]",
};

// Floor-standing machines fill more of the frame than countertop ones.
const machineHeight: Record<MachineKind, string> = {
  kiosk: "h-[78%]",
  ticket: "h-[74%]",
  pos: "h-[46%]",
  scale: "h-[44%]",
  kds: "h-[46%]",
  queue: "h-[40%]",
  vending: "h-[80%]",
};

const DEFAULT_SIZES = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw";

export function PlaceholderImage({
  ratio = "4/3",
  label,
  className,
  src,
  sizes = DEFAULT_SIZES,
  machine,
  tone = "neutral",
}: {
  ratio?: Ratio;
  label: string;
  className?: string;
  /** Real uploaded photo URL. Falls back to an illustration when unset. */
  src?: string;
  /** Override when this image isn't in a typical 2-4 column grid (e.g. a full-width hero). */
  sizes?: string;
  /** Which machine to draw while no photo has been uploaded. */
  machine?: MachineKind;
  /** "ember" puts the illustration on the brand-orange stage (page heroes). */
  tone?: "neutral" | "ember";
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-surface-2 ${ratioClass[ratio]} ${className ?? ""}`}>
        <Image src={src} alt={label} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-end justify-center overflow-hidden rounded-xl ${
        tone === "ember" ? "stage-grid bg-primary-500" : "stage-grid-ink bg-surface-2"
      } ${ratioClass[ratio]} ${className ?? ""}`}
    >
      {machine ? (
        <>
          <span aria-hidden className="absolute inset-x-[8%] bottom-[11%] h-px bg-text-1/20" />
          <MachineArt kind={machine} className={`relative mb-[11%] ${machineHeight[machine]}`} />
        </>
      ) : (
        <Image
          src="/images/brand/logo.png"
          alt=""
          width={130}
          height={27}
          className="absolute left-1/2 top-1/2 h-6 w-auto -translate-x-1/2 -translate-y-1/2 opacity-25 grayscale"
        />
      )}
    </div>
  );
}
