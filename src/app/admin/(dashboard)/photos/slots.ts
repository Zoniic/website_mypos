export type SiteImageSlot = {
  key: string;
  label: string;
  hint: string;
  ratio: "1/1" | "4/3" | "16/9";
};

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    key: "hero",
    label: "Homepage hero photo",
    hint: "Product/self-service photo, landscape. At least 1200×900px.",
    ratio: "4/3",
  },
  {
    key: "about-team",
    label: "Homepage \"Who We Are\" photo",
    hint: "Team or factory photo, landscape. At least 1200×900px.",
    ratio: "4/3",
  },
  {
    key: "about-assembly",
    label: "About page — product assembly photo",
    hint: "Landscape. At least 1200×900px.",
    ratio: "4/3",
  },
  {
    key: "solution-self-order",
    label: "Solution photo — Self-Order Kiosk",
    hint: "Used on the homepage and the solution's own page. Landscape, at least 1200×675px.",
    ratio: "16/9",
  },
  {
    key: "solution-weigh-pay",
    label: "Solution photo — Weigh & Pay",
    hint: "Landscape, at least 1200×900px.",
    ratio: "4/3",
  },
  {
    key: "solution-pos",
    label: "Solution photo — Point of Sale",
    hint: "Landscape, at least 1200×900px.",
    ratio: "4/3",
  },
  {
    key: "solution-ticketing",
    label: "Solution photo — Ticketing Kiosk",
    hint: "Landscape, at least 1200×900px.",
    ratio: "4/3",
  },
  {
    key: "software-hero",
    label: "Software page hero photo",
    hint: "Screenshot or UI mockup, landscape. At least 1200×900px.",
    ratio: "4/3",
  },
];
