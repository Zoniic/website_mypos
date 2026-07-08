"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type QuoteCartItem = {
  slug: string;
  name: string;
  imageUrl?: string;
  priceFrom: number;
  quantity: number;
};

type QuoteCartContextValue = {
  items: QuoteCartItem[];
  addItem: (product: Omit<QuoteCartItem, "quantity">) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
  isInCart: (slug: string) => boolean;
};

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

const STORAGE_KEY = "mypos-quote-cart";

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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
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
      addItem: (product) => {
        setItems((prev) => {
          if (prev.some((item) => item.slug === product.slug)) return prev;
          return [...prev, { ...product, quantity: 1 }];
        });
      },
      removeItem: (slug) => {
        setItems((prev) => prev.filter((item) => item.slug !== slug));
      },
      setQuantity: (slug, quantity) => {
        setItems((prev) =>
          prev.map((item) => (item.slug === slug ? { ...item, quantity: Math.max(1, quantity) } : item))
        );
      },
      clear: () => setItems([]),
      isInCart: (slug) => items.some((item) => item.slug === slug),
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
