const HINTS = {
  slug: {
    tip: "This becomes part of the page URL. Keep it lowercase, hyphen-separated, and keyword-rich — don't change it after the page is live (breaks existing links and search rankings).",
    example: "mypos-t2-android-pos  (not: product1 or MYPOS_T2!!)",
  },
  name: {
    tip: "This also becomes the image's alt text automatically, and feeds the page title — write it the way a customer would search, not an internal code name.",
    example: '"15-inch Android POS Terminal" (not: "T2-V3-FINAL")',
  },
  description: {
    tip: "First 1-2 sentences matter most — search engines and customers both skim the start. Mention the real use case or business type.",
    example: '"Built for busy restaurants that need fast order-taking at the counter."',
  },
  metaTitle: {
    tip: "Shown as the blue clickable headline in Google search results. Keep it under ~60 characters so it doesn't get cut off, and put the most important keyword first.",
    example: '"Android POS Terminal for Restaurants | MYPOS" (~45 chars)',
  },
  metaDescription: {
    tip: "Shown as the gray snippet under the title in search results. Aim for 120-160 characters — too short wastes the space, too long gets truncated with '...'.",
    example: '"15-inch Android POS terminal built for Thai restaurants. Fast setup, offline mode, free demo available."',
  },
  altText: {
    tip: "Describes the image for screen readers and image search — since this site auto-generates alt text from the Name field above, make sure Name is descriptive, not a product code.",
    example: '"MYPOS self-order kiosk in a food court" (not: "IMG_2024")',
  },
} as const;

export type SeoHintType = keyof typeof HINTS;

export function SeoHint({ type }: { type: SeoHintType }) {
  const { tip, example } = HINTS[type];
  return (
    <p className="mt-1 flex gap-1.5 text-xs text-text-2">
      <span aria-hidden="true">💡</span>
      <span>
        <span className="font-medium text-text-1">SEO tip:</span> {tip}
        <br />
        <span className="italic">e.g. {example}</span>
      </span>
    </p>
  );
}

/** Live character counter for meta title/description fields, with a color cue when out of the recommended range. */
export function CharCounter({
  length,
  min,
  max,
}: {
  length: number;
  min: number;
  max: number;
}) {
  const inRange = length >= min && length <= max;
  return (
    <span className={`text-xs ${inRange ? "text-success" : "text-warning"}`}>
      {length}/{max} characters {inRange ? "✓" : length > max ? "(too long)" : "(a bit short)"}
    </span>
  );
}
