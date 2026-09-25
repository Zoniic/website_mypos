"use client";

import { useEffect } from "react";
import { track, type TrackItem } from "@/lib/analytics";

/** Sends one "view_item" event (GA4 view_item / Meta ViewContent / ...) when a product page opens. */
export function TrackView({ item }: { item: TrackItem }) {
  const { id, name, price, category } = item;
  useEffect(() => {
    // Give consented pixels a moment to initialise on a fresh page load.
    const timer = setTimeout(() => track({ name: "view_item", item: { id, name, price, category } }), 800);
    return () => clearTimeout(timer);
  }, [id, name, price, category]);
  return null;
}
