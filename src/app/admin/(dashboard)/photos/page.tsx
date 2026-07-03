import { getSiteImages } from "@/lib/siteSettings";
import { PhotosForm } from "./PhotosForm";

export default async function AdminPhotosPage() {
  const currentUrls = await getSiteImages();

  return (
    <div>
      <h1 className="text-2xl font-bold">Site Photos</h1>
      <p className="mt-1 text-text-2">
        Section photos used on the homepage, about page, solution pages, and software page.
      </p>
      <div className="mt-6">
        <PhotosForm currentUrls={currentUrls} />
      </div>
    </div>
  );
}
