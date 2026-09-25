"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * The shopping cart for online orders — separate from the quote/compare
 * list (quoteCart.tsx), which is for configurable systems priced by quote.
 * Prices here are for display only: the server recomputes every line from
 * the database when the order is placed.
 */
export type CartItemKind = "product" | "accessory";

export type CartItem = {
  kind: CartItemKind;
  slug: string;
  name: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
};

type ShopCartContextValue = {
  items: CartItem[];
  hydrated: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (kind: CartItemKind, slug: string, quantity: number) => void;
  remove: (kind: CartItemKind, slug: string) => void;
  clear: () => void;
};

const ShopCartContext = createContext<ShopCartContextValue | null>(null);

const STORAGE_KEY = "mypos-shop-cart";
export const MAX_QUANTITY = 99;

const same = (a: { kind: string; slug: string }, kind: string, slug: string) => a.kind === kind && a.slug === slug;

export function ShopCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // One-time sync from localStorage on mount (not available during SSR).
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(parsed)) setItems(parsed as CartItem[]);
    } catch {
      // Malformed or blocked storage: start with an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full/blocked: the cart still works for this visit.
    }
  }, [items, hydrated]);

  const value = useMemo<ShopCartContextValue>(
    () => ({
      items,
      hydrated,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      add: (item, quantity = 1) =>
        setItems((prev) => {
          const existing = prev.find((p) => same(p, item.kind, item.slug));
          if (existing) {
            return prev.map((p) =>
              same(p, item.kind, item.slug)
                ? { ...p, ...item, quantity: Math.min(MAX_QUANTITY, p.quantity + quantity) }
                : p
            );
          }
          return [...prev, { ...item, quantity: Math.min(MAX_QUANTITY, quantity) }];
        }),
      setQuantity: (kind, slug, quantity) =>
        setItems((prev) =>
          prev.map((p) =>
            same(p, kind, slug) ? { ...p, quantity: Math.max(1, Math.min(MAX_QUANTITY, Math.round(quantity) || 1)) } : p
          )
        ),
      remove: (kind, slug) => setItems((prev) => prev.filter((p) => !same(p, kind, slug))),
      clear: () => setItems([]),
    }),
    [items, hydrated]
  );

  return <ShopCartContext.Provider value={value}>{children}</ShopCartContext.Provider>;
}

export function useShopCart(): ShopCartContextValue {
  const ctx = useContext(ShopCartContext);
  if (!ctx) throw new Error("useShopCart must be used within ShopCartProvider");
  return ctx;
}
