"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { slugKey } from "@/lib/slug";

/** A machine (/products) or an accessory (/accessories). Lists saved before accessories could be added have no kind: they are machines. */
export type QuoteItemKind = "product" | "accessory";

export type QuoteCartItem = {
  kind: QuoteItemKind;
  slug: string;
  name: string;
  imageUrl?: string;
  /** "Starting at" price; null = ask for a price (accessories without a price). */
  priceFrom: number | null;
  quantity: number;
};

type QuoteCartContextValue = {
  items: QuoteCartItem[];
  addItem: (item: Omit<QuoteCartItem, "quantity" | "kind"> & { kind?: QuoteItemKind }) => void;
  removeItem: (slug: string, kind?: QuoteItemKind) => void;
  setQuantity: (slug: string, quantity: number, kind?: QuoteItemKind) => void;
  clear: () => void;
  isInCart: (slug: string, kind?: QuoteItemKind) => boolean;
};

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

const STORAGE_KEY = "mypos-quote-cart";

const same = (item: QuoteCartItem, slug: string, kind: QuoteItemKind) => item.slug === slug && item.kind === kind;

/**
 * Lists saved before the slugs were made URL-safe hold old slugs ("mypos-K1"): map them to the new ones.
 * Lists saved before accessories could be added have no kind: those lines are machines.
 */
function normaliseSavedItems(items: Partial<QuoteCartItem>[]): QuoteCartItem[] {
  const merged: QuoteCartItem[] = [];
  for (const item of items) {
    if (typeof item?.slug !== "string" || typeof item.name !== "string") continue;
    const kind: QuoteItemKind = item.kind === "accessory" ? "accessory" : "product";
    // Only machine slugs were migrated; accessory slugs are kept as saved.
    const slug = kind === "product" ? slugKey(item.slug) || item.slug : item.slug;
    const priceFrom = typeof item.priceFrom === "number" && Number.isFinite(item.priceFrom) ? item.priceFrom : null;
    const quantity = Math.max(1, Math.round(Number(item.quantity)) || 1);
    if (!merged.some((m) => same(m, slug, kind))) merged.push({ kind, slug, name: item.name, imageUrl: item.imageUrl, priceFrom, quantity });
  }
  return merged;
}

export function QuoteCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<QuoteCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time sync from an external system (localStorage) on mount — the
    // sanctioned exception to "avoid setState in effects" per React's own
    // docs, since window/localStorage aren't available during SSR and this
    // can't be a lazy useState initializer.
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setItems(normaliseSavedItems(parsed as Partial<QuoteCartItem>[]));
      }
    } catch {
      // Ignore malformed/unavailable localStorage — cart just starts empty.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<QuoteCartContextValue>(
    () => ({
      items,
      addItem: ({ kind = "product", ...item }) => {
        setItems((prev) => {
          if (prev.some((existing) => same(existing, item.slug, kind))) return prev;
          return [...prev, { ...item, kind, quantity: 1 }];
        });
      },
      removeItem: (slug, kind = "product") => {
        setItems((prev) => prev.filter((item) => !same(item, slug, kind)));
      },
      setQuantity: (slug, quantity, kind = "product") => {
        setItems((prev) =>
          prev.map((item) => (same(item, slug, kind) ? { ...item, quantity: Math.max(1, quantity) } : item))
        );
      },
      clear: () => setItems([]),
      isInCart: (slug, kind = "product") => items.some((item) => same(item, slug, kind)),
    }),
    [items]
  );

  return <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>;
}

export function useQuoteCart(): QuoteCartContextValue {
  const ctx = useContext(QuoteCartContext);
  if (!ctx) throw new Error("useQuoteCart must be used within QuoteCartProvider");
  return ctx;
}
