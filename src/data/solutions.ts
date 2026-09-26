import type { ProductCategory } from "@/data/categories";
import type { MachineKind } from "@/components/ui/MachineArt";

export const solutionSlugs = [
  "self-order",
  "pos",
  "kds",
  "weigh-pay",
  "queue-display",
  "vending-online",
  "vending-offline",
  "ticketing",
] as const;

export type SolutionSlug = (typeof solutionSlugs)[number];

/** Maps a URL slug to its messages key under the `solutions` namespace. */
export const solutionMessageKey: Record<SolutionSlug, string> = {
  "self-order": "selfOrder",
  pos: "pos",
  kds: "kds",
  "weigh-pay": "weighPay",
  "queue-display": "queueDisplay",
  "vending-online": "vendingOnline",
  "vending-offline": "vendingOffline",
  ticketing: "ticketing",
};

/** Maps a URL slug to the product category shown in its comparison table. */
export const solutionCategory: Record<SolutionSlug, ProductCategory> = {
  "self-order": "self-order",
  pos: "pos",
  kds: "kds",
  "weigh-pay": "weigh-pay",
  "queue-display": "queue-display",
  "vending-online": "vending-online",
  "vending-offline": "vending-offline",
  ticketing: "ticketing",
};

/** The machine drawn for a solution / product category until a photo is uploaded. */
export const solutionMachine: Record<SolutionSlug, MachineKind> = {
  "self-order": "kiosk",
  pos: "pos",
  kds: "kds",
  "weigh-pay": "scale",
  "queue-display": "queue",
  "vending-online": "vending",
  "vending-offline": "vending",
  ticketing: "ticket",
};

/**
 * Product lines as the business groups them. Drives the header's Solutions
 * menu. Every "online" line is managed from the MYPOS back office; the
 * offline vending machine is the one standalone product.
 */
export const solutionGroups: {
  key: "restaurant" | "vending" | "ticketing" | "backOffice";
  items: { key: string; href: string }[];
}[] = [
  {
    key: "restaurant",
    items: [
      { key: "selfOrder", href: "/solutions/self-order" },
      { key: "pos", href: "/solutions/pos" },
      { key: "kds", href: "/solutions/kds" },
      { key: "weighPay", href: "/solutions/weigh-pay" },
      { key: "queueDisplay", href: "/solutions/queue-display" },
    ],
  },
  {
    key: "vending",
    items: [
      { key: "vendingOnline", href: "/solutions/vending-online" },
      { key: "vendingOffline", href: "/solutions/vending-offline" },
    ],
  },
  { key: "ticketing", items: [{ key: "ticketing", href: "/solutions/ticketing" }] },
  {
    key: "backOffice",
    items: [
      { key: "dashboard", href: "/software" },
      { key: "coupons", href: "/software#coupons" },
    ],
  },
];

/** Lines managed from the MYPOS back office website. */
const ONLINE_SOLUTIONS: readonly SolutionSlug[] = [
  "self-order",
  "pos",
  "kds",
  "weigh-pay",
  "queue-display",
  "vending-online",
];

export function isOnlineSolution(slug: SolutionSlug): boolean {
  return ONLINE_SOLUTIONS.includes(slug);
}

export function isSolutionSlug(value: string): value is SolutionSlug {
  return (solutionSlugs as readonly string[]).includes(value);
}
