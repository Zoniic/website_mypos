import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import type { MachineKind } from "@/components/ui/MachineArt";

const galleryLabels = ["side", "back", "in use"];

export function ProductGallery({
  name,
  imageUrl,
  galleryUrls = [],
  machine,
}: {
  name: string;
  imageUrl?: string;
  galleryUrls?: string[];
  /** Drawn in the main slot until a photo is uploaded. */
  machine?: MachineKind;
}) {
  // Empty gallery slots only add three grey boxes — show them once a photo exists.
  const gallery = galleryLabels
    .map((label, index) => ({ label, src: galleryUrls[index] }))
    .filter((item) => item.src);

  return (
    <div>
      <PlaceholderImage ratio="1/1" label={`${name} — main photo`} src={imageUrl} machine={machine} />
      {gallery.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3">
          {gallery.map((item) => (
            <PlaceholderImage key={item.label} ratio="1/1" label={`${name} — ${item.label}`} src={item.src} />
          ))}
        </div>
      )}
    </div>
  );
}
