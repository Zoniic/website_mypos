---
name: MYPOS
description: Thai-manufactured POS and self-service systems, marketed with a dark register-glow aesthetic
colors:
  primary: "#e85520"
  primary-deep: "#cc4515"
  primary-bright: "#f06830"
  accent: "#3b82f6"
  bg: "#07090f"
  surface-0: "#0c0f1b"
  surface-1: "#111525"
  surface-2: "#181d30"
  surface-3: "#1f253b"
  border: "rgba(255,255,255,0.08)"
  border-strong: "rgba(255,255,255,0.16)"
  text-primary: "#f1f5f9"
  text-secondary: "#94a3b8"
  success: "#10b981"
  warning: "#f59e0b"
  error: "#ef4444"
typography:
  display:
    fontFamily: "IBM Plex Sans Thai, Prompt, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Prompt, Noto Sans Thai, PingFang SC, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Prompt, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.04em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  card: "16px"
  tag: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-bright}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 24px"
  card:
    backgroundColor: "{colors.surface-1}"
    rounded: "{rounded.card}"
    padding: "24px"
---

# Design System: MYPOS

## 1. Overview

**Creative North Star: "The Night Register"**

MYPOS builds and sells the physical POS terminals, self-order kiosks, and weigh-and-pay stations that Thai shops run every night after the lights go down and the till is still glowing. The visual system takes that literally: a near-black interface (`#07090f`) that reads like a terminal screen left on after close, with the brand's ember orange (`#e85520`) doing the work a receipt printer's LED or an active register display would — warm, specific, alive, never decorative for its own sake. This is a manufacturer's site, not a reseller's storefront: every visual choice should read as "we built this and stand behind it," not "we're dropshipping this."

The system explicitly rejects the **boring corporate/factory website** anti-reference from PRODUCT.md — no navy-and-gray B2B slabs, no stock photography of people shaking hands, no dense unbroken text walls. It also rejects tipping into **discount marketplace** energy (no red sale badges, no countdown urgency, no cluttered grid-of-everything). The register stays quiet until it has something real to say.

**Key Characteristics:**
- Near-black base surfaces with layered depth (four surface steps, not one flat panel)
- Ember orange used deliberately — gradient fills on primary actions and glow accents, never applied as wallpaper
- Motion is ambient and slow (drifting glow blobs, gentle card lift) — never bouncy, never attention-grabbing for its own sake
- Every decorative element must be grounded in something real (an actual customer photo, an actual stat) — no floating icon-soup badges with no label

## 2. Colors

Dark and specific, not generic "dark mode." The base is a near-black with a faint blue undertone (not neutral gray), and warmth is carried entirely by the orange, not by the background.

### Primary
- **Ember Orange** (`#e85520`): The MYPOS brand color. Carries primary CTAs (as a gradient with its brighter neighbor), active nav states, eyebrow labels, and the ambient glow blobs behind hero sections. Used as gradient fill (`linear-gradient(135deg, #cc4515, #f06830)`) on buttons and gradient-clipped text sparingly, and as a low-opacity tint (`color-mix(in srgb, currentColor 12%, transparent)`) behind pill labels.

### Secondary
- **Interface Blue** (`#3b82f6`): Reserved for UI/interactive accents that need to read as distinct from the primary brand action — the second ambient glow blob in hero sections, occasional secondary data highlights. Never used on a primary CTA; that role belongs to orange alone.

### Neutral
- **Register Black** (`#07090f`): Page background. The base the whole system sits on.
- **Panel** (`#0c0f1b` / `#111525` / `#181d30` / `#1f253b`): Four ascending surface steps (surface-0 through surface-3) for layered depth — cards sit on surface-1, elevated/hover states step up to surface-2.
- **Hairline** (`rgba(255,255,255,0.08)` default, `rgba(255,255,255,0.16)` strong): Borders. Never a solid gray; always a white-alpha hairline so it reads correctly against any of the four surface steps.
- **Signal White** (`#f1f5f9`): Primary text.
- **Muted Slate** (`#94a3b8`): Secondary text, captions, metadata.

### Named Rules
**The One Register Rule.** Ember orange is the only color allowed on a primary call-to-action. Interface Blue, success green, and warning amber are supporting cast — they appear in ambient decoration, status badges, and secondary UI, never on the button that matters most on the page.

## 3. Typography

**Display Font:** IBM Plex Sans Thai (with Prompt, system-ui fallback)
**Body Font:** Prompt (with Noto Sans Thai, PingFang SC, Microsoft YaHei, Noto Sans SC, system-ui fallback)
**Label/Mono Font:** JetBrains Mono (latin only; reserved for genuinely tabular/code contexts, not for UI labels — Thai/Chinese eyebrow text must stay on the sans stack, since monospace metrics clip CJK/Thai glyphs)

**Character:** Prompt carries the bulk of the UI — a geometric-humanist Thai/Latin sans that reads clean at both display and body sizes. IBM Plex Sans Thai is reserved for hero/h1-scale headings only, giving them a slightly more technical, engineered edge that suits a hardware manufacturer without breaking from the same visual family as the body face.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 5vw, 3.75rem)`, 1.1 line-height, -0.02em tracking): Hero and page-level h1 only.
- **Headline** (700, 1.5–1.875rem): Section h2s.
- **Title** (600, 1.125–1.25rem): Card titles, h3s.
- **Body** (400, 1rem, 1.6 line-height): Paragraph copy. Capped near 65–75ch measure on long-form pages (About, Knowledge Base articles).
- **Label** (600, 0.75rem, 0.04em tracking): Eyebrow pills, badges, filter labels. Always on the sans stack, never mono.

### Named Rules
**The No-Monospace-For-Language Rule.** JetBrains Mono is for genuinely monospaced content (SKU codes, technical specs) only. It was previously used for eyebrow labels and visibly clipped Thai text metrics — a mistake, now corrected. Default every UI label to Prompt.

## 4. Elevation

Layered, not flat, but restrained: four surface steps (`surface-0` → `surface-3`) provide depth by lightness alone, and a soft ambient shadow (`shadow-card`) plus a 1px inset highlight give panels a faint lift off the register-black background. Depth escalates on interaction — hover states step up a shadow tier and add a low-opacity orange glow — so elevation itself communicates "this responded to you," not just static hierarchy.

### Shadow Vocabulary
- **card** (`0 4px 16px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.08)`): Default resting state for any card/panel.
- **card-hover** (`0 8px 32px rgba(0,0,0,0.55), 0 0 32px rgba(232,85,32,0.12), inset 0 0 0 1px rgba(255,255,255,0.08)`): Hover/active state — heavier shadow plus a faint ember glow bleeding out from the card edge.
- **glow-primary** (`0 0 24px rgba(232,85,32,0.4), 0 0 8px rgba(232,85,32,0.25)`): Primary buttons at rest — the "screen glow" signature, not just a drop shadow.
- **glow-accent** (`0 0 24px rgba(59,130,246,0.4), 0 0 8px rgba(59,130,246,0.25)`): Reserved for blue/secondary emphasis moments.

### Named Rules
**The Glow-On-Response Rule.** Ambient orange glow (as opposed to a plain dark shadow) only appears on the primary CTA at rest and on any card the instant it's hovered/focused. It never sits on static, non-interactive content — glow signals "this is live," and using it decoratively cheapens the signal.

## 5. Components

### Buttons
- **Shape:** 8px radius (`--radius-button`), never fully rounded except the language-switcher pill.
- **Primary:** Ember gradient fill (`linear-gradient(135deg, #cc4515, #f06830)`), signal-white text, `glow-primary` shadow at rest, `brightness(1.1)` + 2px lift on hover, scale-down on active press.
- **Ghost / ambiguous secondary action:** Transparent background, `border-strong` hairline border, fills to `surface-2` on hover.
- **Line (LINE-chat CTA specifically):** Solid emerald green (`bg-emerald-700`, hover `emerald-600`) — the one deliberate exception to the orange-only CTA rule, because it signals the LINE messaging app by its own established brand green, not a MYPOS action.

### Chips / Eyebrow Labels
- **Style (`.ticket-tag`):** Tinted pill — `background-color: color-mix(in srgb, currentColor 12%, transparent)`, fully rounded (`--radius-tag`), no border. Font is always the sans stack (see Typography's No-Monospace Rule), 600 weight, 0.04em tracking, 0.75rem size.
- **State:** No hover/active state — these are static labels, not controls.

### Cards / Containers
- **Corner Style:** 16px (`--radius-card`).
- **Background:** `surface-1` at ~40% opacity over the page background (`bg-surface-1/40`), or full `surface-1` for denser data cards.
- **Shadow Strategy:** `card` at rest, `card-hover` plus a 4px upward translate and a subtle orange-tinted border (`border-primary-400/40`) on hover — see Elevation.
- **Border:** 1px hairline (`--color-border`) at rest, brightens to a faint orange tint on hover.
- **Internal Padding:** 24px typical (`p-6`), 16px for compact list-style cards.

### Inputs / Fields
- **Style:** `surface-0` background, `border-strong` hairline, 8px radius (`--radius-input`).
- **Focus:** 2px outline in primary orange, offset 2px — no glow/blur, kept crisp for legibility on form-heavy admin pages.

### Navigation
- **Style:** Sticky header, `bg-bg/90` with backdrop blur, bottom hairline border. Top-level links get an animated gradient underline on hover (scale-x from 0 to 1). Dropdown menus (Products mega-menu, Resources, language switcher) share one interaction pattern: hover/focus opens, outside-click or Escape closes, chevron rotates 180° when open — declared once as a shared `useDropdown()` hook rather than duplicated per menu.
- **Mobile:** Full-width slide-down panel below the sticky header; dropdown groups become flat labeled sections instead of hover menus (touch has no hover).

### Floating Decorative Badges (signature anti-pattern, documented as a Don't)
Previously the Hero section carried a floating checkmark-and-barcode-stripe badge with no text label, animated with a gentle bob. It looked like decoration for decoration's sake — nothing it displayed was real (no actual stat, no actual claim) — and was removed. See Do's and Don'ts.

## 6. Do's and Don'ts

### Do:
- **Do** use Ember Orange (`#e85520`) as the only color on primary CTAs; everything else is supporting cast (see The One Register Rule).
- **Do** ground every decorative or motion element in something real — an actual customer photo and logo (References cards), an actual number from `getSiteSettings()` (stats), an actual product photo. If a badge or icon can't cite a real fact, cut it.
- **Do** set eyebrow/label text in the Prompt sans stack, never JetBrains Mono — Thai and Chinese glyph metrics clip in monospace fonts (see The No-Monospace-For-Language Rule).
- **Do** group navigation by what the visitor is trying to do (by use case / by product category), and fold low-traffic pages into a shared "Resources" menu rather than letting every route claim top-level nav space.
- **Do** use the orange glow (`glow-primary` / `card-hover`) only on interactive elements at rest or on hover — it signals "this responds to you."

### Don't:
- **Don't** ship a floating decorative badge (icon + pattern, no text) with a bob/float animation — the barcode-and-checkmark badge removed from the Hero is the canonical example of this failure; it read as AI-generated filler because it said nothing.
- **Don't** design this as a boring corporate/factory site — no navy-and-gray B2B palette, no stock photography of generic handshakes, no dense text walls (PRODUCT.md anti-reference, verbatim).
- **Don't** tip into discount-marketplace energy either — no red sale badges, no countdown timers, no Shopee/Lazada-style dense promotional grids.
- **Don't** apply monospace fonts to any UI label, eyebrow, or Thai/Chinese body text — reserve JetBrains Mono for genuinely tabular data (SKUs, specs).
- **Don't** let the top nav sprawl past roughly 4-5 top-level items; if a new section is being added, ask whether it belongs inside an existing dropdown (Products, Resources) before giving it its own slot.
