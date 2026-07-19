---
name: MYPOS
description: Thai-manufactured POS and self-service systems — light premium "Showroom White" theme
colors:
  primary: "#e85520"
  primary-deep: "#cc4515"
  primary-bright: "#f06830"
  accent: "#2563eb"
  bg: "#ffffff"
  surface-0: "#f7f7f8"
  surface-1: "#fcfcfd"
  surface-2: "#f1f2f4"
  surface-3: "#e9ebee"
  border: "rgba(17,19,24,0.08)"
  border-strong: "rgba(17,19,24,0.16)"
  text-primary: "#111318"
  text-secondary: "#5c6470"
  success: "#059669"
  warning: "#d97706"
  error: "#dc2626"
---

# Design System: MYPOS — "Showroom White"

> Branch `out-rule-design`. This document describes the light premium theme
> that replaced the original dark "Night Register" system. The visual
> language is adapted from the consumer-electronics showroom tradition
> (Xiaomi / Apple / Nothing / Japanese minimalism): white gallery space,
> ink typography, soft diffuse shadows, generous whitespace — with MYPOS's
> Ember Orange as the single point of heat.
>
> **The only binding rule** carried over from the previous system is The One
> Register Rule (§2). Everything else here is descriptive documentation of
> the current implementation, not constraint.

## 1. Overview

**Creative North Star: "The Showroom"**

The hardware is the hero. A white, evenly-lit space where the products —
kiosks, POS terminals, weigh stations — read like exhibits, and the brand's
Ember Orange (`#e85520`) marks exactly one thing: the action we want you to
take. Depth comes from tint and hairline, not darkness. Motion is calm and
ambient. Density is low; whitespace is a feature.

**Key characteristics**
- White base (`#ffffff`) with four ascending gray surface steps for grouping/hover
- Ink text (`#111318`), never pure black; slate secondary text
- Black-alpha hairline borders (they read correctly on every surface step)
- Soft, diffuse shadows — elevation whispers, never drops hard black
- Ember Orange concentrated on primary CTAs; blue for secondary interactive accents
- Slightly generous radii (buttons 10px, cards 18px) for the premium read

## 2. Color Tokens

All tokens live in `src/app/globals.css` as Tailwind v4 `@theme` CSS
variables — that file is the single source of truth; this table documents it.
Machine-readable copy: `design-tokens.json` (repo root).

| Token | HEX | RGB | HSL | Role |
|---|---|---|---|---|
| `--color-bg` | `#ffffff` | 255 255 255 | 0 0% 100% | Page background |
| `--color-surface-0` | `#f7f7f8` | 247 247 248 | 240 7% 97% | Alternate sections, table heads |
| `--color-surface-1` | `#fcfcfd` | 252 252 253 | 240 25% 99% | Cards |
| `--color-surface-2` | `#f1f2f4` | 241 242 244 | 220 12% 95% | Hover fills, wells |
| `--color-surface-3` | `#e9ebee` | 233 235 238 | 216 13% 92% | Pressed / deepest step |
| `--color-border` | `rgba(17,19,24,.08)` | — | — | Default hairline |
| `--color-border-subtle` | `rgba(17,19,24,.04)` | — | — | Faint dividers |
| `--color-border-strong` | `rgba(17,19,24,.16)` | — | — | Inputs, emphasized edges |
| `--color-primary-500` | `#e85520` | 232 85 32 | 16 81% 52% | **Ember Orange** — brand |
| `--color-primary-600` | `#cc4515` | 204 69 21 | 16 81% 44% | Orange text/links on white (AA) |
| `--color-primary-400` | `#f06830` | 240 104 48 | 17 86% 56% | Gradient bright stop |
| `--color-accent-600` | `#2563eb` | 37 99 235 | 221 83% 53% | Cool Blue — secondary interactive |
| `--color-text-1` | `#111318` | 17 19 24 | 223 17% 8% | Primary ink |
| `--color-text-2` | `#5c6470` | 92 100 112 | 216 10% 40% | Secondary / captions |
| `--color-text-3` | `#9aa1ac` | 154 161 172 | 217 10% 64% | Tertiary / disabled |
| `--color-text-inverse` | `#ffffff` | 255 255 255 | 0 0% 100% | Text on orange/dark fills |
| `--color-success` | `#059669` | 5 150 105 | 161 94% 30% | Success (AA on white) |
| `--color-warning` | `#d97706` | 217 119 6 | 32 95% 44% | Warning |
| `--color-error` | `#dc2626` | 220 38 38 | 0 72% 51% | Error |

Full primary scale 50–900 is defined in `globals.css`. There is **no dark
mode** — single light theme by product decision; `color-scheme: light` is
declared on `body`.

### Named Rule (the only one)

**The One Register Rule.** Ember Orange is the only color allowed on a
primary call-to-action. Blue, green, amber are supporting cast — never on
the button that matters most. (One standing exception: LINE-chat CTAs use
LINE's own emerald green, because they signal that app's brand, not a MYPOS
action.)

### Contrast conventions
- Orange **as text** on white uses `primary-600` (`#cc4515`, ≈4.8:1) — never
  `primary-400/300`, which fail AA on white.
- Text on orange/gradient or emerald fills is always `text-white`, never
  `text-text-1` (ink-on-orange fails).
- `text-2` (`#5c6470`, ≈5.9:1) is the floor for body-size secondary text.

## 3. Typography

Google Fonts, loaded via `next/font` in `src/app/[locale]/layout.tsx`:

| Role | Font | Weights | Notes |
|---|---|---|---|
| Display / h1 | IBM Plex Sans Thai | 600, 700 | `font-display`; hero + page titles only |
| Body / UI | Prompt | 400, 500, 600, 700 | `font-sans`; Thai+Latin, CJK fallbacks |
| Mono | JetBrains Mono | 500 | `font-mono`; SKUs, prices, tabular data only — never Thai/Chinese UI labels (glyph clipping) |

Scale in use: Display `clamp(2.25rem, 5vw, 3.75rem)` / 700 / 1.1 / -0.02em ·
Headline 1.5–1.875rem / 700 · Title 1.125–1.25rem / 600 · Body 1rem / 400 /
1.6 · Label 0.75rem / 600 / +0.04em. Long-form measure capped ~65–75ch.

## 4. Spacing

Tailwind's default 4pt scale is used as-is (`p-1` = 4px … `py-16` = 64px,
`py-24` = 96px). Section rhythm: `py-10` compact pages, `py-16` marketing
sections, `py-24`+ hero. Card padding 24px (`p-6`), compact lists 16px.

## 5. Radius

`--radius-xs` 4 · `sm` 6 · `md` 10 · `lg` 14 · `xl` 18 · `2xl` 22 · `3xl` 28 ·
`tag` 9999. Semantic: button/input = md (10px), card = xl (18px),
modal = 2xl (22px).

## 6. Shadows

Light-theme elevation: tint + hairline first, shadow second. All shadows are
soft ink-alpha, no hard black.

- `xs…2xl` — ascending diffuse shadows, `rgba(17,19,24, .05–.13)`
- `card` — `0 1px 2px .04, 0 8px 24px .06` + inset 1px hairline (rest state)
- `card-hover` — deeper spread + stronger hairline; pairs with a 4px lift and
  an orange-tinted border on interactive cards
- `glow-primary` — warm orange halo, reserved for the primary CTA at rest
- `glow-accent` — blue equivalent for rare secondary emphasis

## 7. Grid & Breakpoints

Container: `max-w-7xl` (1280px) with `px-4 sm:px-6 lg:px-8`. Content grids
are contextual (2-col sm / 3–4-col lg product grids). Breakpoints are
Tailwind defaults: sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536. Mobile
gets the sticky bottom action bar (`StickyMobileBar`) instead of hover nav.

## 8. Components (implementation index)

- **Buttons** — `src/components/ui/Button.tsx`: `primary` (orange gradient,
  white text, glow, lift on hover), `ghost` (hairline, fills surface-2),
  `line` (LINE emerald, white text). Radius `--radius-button`.
- **Cards** — hairline border + `bg-surface-1/40`, `shadow-card`; hover:
  `-translate-y-1`, `shadow-card-hover`, orange-tint border.
- **Eyebrow pills** — `.ticket-tag` (currentColor tint at 10%).
- **Frosted overlay** — `.liquid-glass` (milky white glass, dark hairline
  gradient edge) for content over imagery/video.
- **Nav** — sticky `bg-bg/90` + blur, hairline bottom border, gradient
  underline on hover, click-outside/Escape dropdowns.
- **Forms** — `surface-0` fill, `border-strong`, 2px orange focus outline.
- **Badges** — `StockBadge` (semantic tint at 10% + 600-weight text).
- **Marquee** — `.animate-marquee` logo strip, pauses on hover.

## 9. Motion

`MotionConfig reducedMotion="user"` wraps the app; CSS animations are
guarded by `prefers-reduced-motion`.

- Route transitions: 0.35s opacity + 8px rise (`template.tsx`)
- Scroll reveal: `FadeIn` (whileInView, once, -80px margin)
- Card hover: 4px lift, 0.35s ease-out; images scale 1.05 over 0.5s
- Ambient: hero blobs drift 14–17s ease-in-out; `ShinyText` ink-and-silver
  shimmer sweep (3s linear loop)
- Nothing bounces; nothing loops faster than 3s.

## 10. Accessibility

- WCAG AA contrast per §2 conventions
- Focus: 2px outline, offset 2, `primary`/`primary-400` per component;
  `focus-visible` only
- Keyboard: dropdowns close on Escape, open on focus; skip-to-content link
  in the header; accordion uses `aria-expanded`/`aria-controls`
- All decorative layers are `aria-hidden`; images carry real alt text
