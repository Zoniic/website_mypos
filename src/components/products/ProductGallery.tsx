import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

const galleryLabels = ["side", "back", "in use"];

export function ProductGallery({
  name,
  imageUrl,
  galleryUrls = [],
}: {
  name: string;
  imageUrl?: string;
  galleryUrls?: string[];
}) {
  return (
    <div>
      <PlaceholderImage ratio="1/1" label={`${name} — main photo`} src={imageUrl} />
      <div className="mt-3 grid grid-cols-3 gap-3">
        {galleryLabels.map((label, index) => (
          <PlaceholderImage
            key={label}
            ratio="1/1"
            label={`${name} — ${label}`}
            src={galleryUrls[index]}
          />
        ))}
      </div>
    </div>
  );
}
