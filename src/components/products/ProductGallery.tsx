import { PlaceholderImage } from "@/components/ui/PlaceholderImage";

export function ProductGallery({ name }: { name: string }) {
  return (
    <div>
      <PlaceholderImage ratio="1/1" label={`${name} — main photo`} />
      <div className="mt-3 grid grid-cols-3 gap-3">
        <PlaceholderImage ratio="1/1" label={`${name} — side`} />
        <PlaceholderImage ratio="1/1" label={`${name} — back`} />
        <PlaceholderImage ratio="1/1" label={`${name} — in use`} />
      </div>
    </div>
  );
}
