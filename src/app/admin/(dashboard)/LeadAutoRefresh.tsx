"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

/** Pages that list incoming leads; edit forms are never refreshed under the admin's hands. */
const LEAD_PAGES = new Set([
  "/admin",
  "/admin/contact-messages",
  "/admin/quote-requests",
  "/admin/warranty-claims",
  "/admin/orders",
]);

const INTERVAL_MS = 30_000;

/** True while the admin is typing or choosing in a field, so a refresh cannot get in the way. */
function isEditing(): boolean {
  const el = document.activeElement;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || (el as HTMLElement).isContentEditable);
}

/**
 * Re-reads the lead lists and the sidebar counts from the server every 30 s
 * while the tab is visible, and right away when the admin comes back to the
 * tab. Shows nothing; uses router.refresh(), so the page and its scroll
 * position stay as they are.
 */
export function LeadAutoRefresh() {
  const router = useRouter();
  const pathname = usePathname();
  const active = LEAD_PAGES.has(pathname);

  useEffect(() => {
    if (!active) return;
    const refresh = () => {
      if (document.visibilityState === "visible" && !isEditing()) router.refresh();
    };
    const timer = window.setInterval(refresh, INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [active, router]);

  return null;
}
