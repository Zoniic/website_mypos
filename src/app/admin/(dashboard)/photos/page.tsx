import { getSiteImages } from "@/lib/siteSettings";
import { AdminGuide } from "../AdminGuide";
import { PhotosForm } from "./PhotosForm";
import { getAllImageSlots } from "./allSlots";

export default async function AdminPhotosPage() {
  const [currentUrls, slots] = await Promise.all([getSiteImages(), getAllImageSlots()]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Site Photos</h1>
      <p className="mt-1 text-text-2">
        Section photos used on the homepage, about page, solution pages, and software page.
      </p>
      <AdminGuide section="photos" />
      <div className="mt-6">
        <PhotosForm currentUrls={currentUrls} slots={slots} />
      </div>
    </div>
  );
}
