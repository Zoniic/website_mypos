"use client";

import dynamic from "next/dynamic";

// The editor (and the admin content guide it shows) is only downloaded by an
// admin in edit mode, never by regular visitors.
const EditOverlay = dynamic(() => import("./EditOverlay"), { ssr: false });

export function EditModeLoader({ locale }: { locale: string }) {
  return <EditOverlay locale={locale} />;
}
