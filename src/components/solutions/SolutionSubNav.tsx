"use client";

import { useEffect, useRef, useState } from "react";

export type SubNavItem = { id: string; label: string };

/**
 * Sticky in-page section nav for long solution pages. Sits directly under
 * the main sticky header (top-16) and highlights the section currently in
 * view via IntersectionObserver — no scroll-position math, no layout thrash.
 */
export function SolutionSubNav({ items }: { items: SubNavItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // Treat the section as "current" once it's crossed into the band just
    // below the sticky header/sub-nav, and before it's mostly scrolled past.
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  // Keep the active tab scrolled into view within the horizontally
  // scrollable strip on narrow screens.
  useEffect(() => {
    const activeEl = navRef.current?.querySelector<HTMLElement>(
      `[data-id="${activeId}"]`
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    activeEl?.scrollIntoView({
      block: "nearest",
      inline: "center",
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [activeId]);

  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Section navigation"
      className="sticky top-16 z-30 border-b border-border bg-bg/90 backdrop-blur"
    >
      <div
        ref={navRef}
        className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <a
              key={item.id}
              data-id={item.id}
              href={`#${item.id}`}
              aria-current={isActive ? "true" : undefined}
              className={`shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 ${
                isActive
                  ? "border-primary-500 text-text-1"
                  : "border-transparent text-text-2 hover:text-text-1"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
