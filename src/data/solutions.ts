import type { ProductCategory } from "@/lib/products";
import type { MachineKind } from "@/components/ui/MachineArt";

export const solutionSlugs = [
  "self-order",
  "weigh-pay",
  "pos",
  "ticketing",
] as const;

export type SolutionSlug = (typeof solutionSlugs)[number];

/** Maps a URL slug to its messages key under the `solutions` namespace. */
export const solutionMessageKey: Record<SolutionSlug, string> = {
  "self-order": "selfOrder",
  "weigh-pay": "weighPay",
  pos: "pos",
  ticketing: "ticketing",
};

/** Maps a URL slug to the product category shown in its comparison table. */
export const solutionCategory: Record<SolutionSlug, ProductCategory> = {
  "self-order": "self-order",
  "weigh-pay": "weigh-pay",
  pos: "pos",
  ticketing: "ticketing",
};

/** The machine drawn for a solution / product category until a photo is uploaded. */
export const solutionMachine: Record<SolutionSlug, MachineKind> = {
  "self-order": "kiosk",
  "weigh-pay": "scale",
  pos: "pos",
  ticketing: "ticket",
};

export function isSolutionSlug(value: string): value is SolutionSlug {
  return (solutionSlugs as readonly string[]).includes(value);
}
