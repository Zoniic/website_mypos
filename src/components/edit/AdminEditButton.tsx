"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * "Edit this page" shortcut for a signed-in admin, keyed off a non-secret
 * hint cookie set at login. /admin/live re-checks the real session.
 */
export function AdminEditButton() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Cookies are only readable after hydration; setting state here is the point.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAdmin(/(?:^|;\s*)mypos_admin=1/.test(document.cookie));
  }, []);

  if (!isAdmin) return null;
  return (
    <a
      href={`/admin/live?path=${encodeURIComponent(pathname)}`}
      className="fixed bottom-24 left-4 z-50 rounded-full bg-[#111318] px-4 py-2 text-xs font-semibold text-white shadow-lg outline-offset-2 hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 lg:bottom-5"
    >
      ✏️ แก้ไขหน้านี้
    </a>
  );
}
