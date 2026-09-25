import { getSiteSettings } from "@/lib/siteSettings";
import { AdminGuide } from "../AdminGuide";
import { SettingsForm } from "./SettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold">Site Settings</h1>
      <p className="mt-1 text-text-2">
        Contact info, map, and homepage stats used across every page.
      </p>
      <AdminGuide section="settings" />
      <div className="mt-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
