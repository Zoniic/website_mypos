"use client";

import { useEffect } from "react";
import { track, type TrackItem } from "@/lib/analytics";

const SENT_KEY = "mypos-tracked-orders";

/**
 * Reports the purchase once per order, even though the customer may come
 * back to this page (it doubles as the order-status page). Ad platforms
 * also de-duplicate on the order number (transaction_id / eventID).
 */
export function PurchaseTracker({
  orderNumber,
  value,
  shipping,
  items,
}: {
  orderNumber: string;
  value: number;
  shipping: number;
  items: TrackItem[];
}) {
  useEffect(() => {
    let sent: string[] = [];
    try {
      sent = JSON.parse(window.localStorage.getItem(SENT_KEY) ?? "[]");
    } catch {
      sent = [];
    }
    if (sent.includes(orderNumber)) return;
    const timer = setTimeout(() => {
      track({ name: "purchase", orderNumber, value, shipping, items });
      try {
        window.localStorage.setItem(SENT_KEY, JSON.stringify([...sent, orderNumber].slice(-50)));
      } catch {
        // Storage blocked: worst case the event repeats and platforms de-dupe it.
      }
    }, 800);
    return () => clearTimeout(timer);
    // Items are a fresh array each render; the order number identifies the purchase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);
  return null;
}
