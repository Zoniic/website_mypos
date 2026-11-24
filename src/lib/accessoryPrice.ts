/** "Starting at" price shown for an accessory: its own, else its online price when online ordering is on. null = ask for a price. */
export function accessoryDisplayPrice(
  item: { priceFrom?: number; onlinePrice?: number },
  shopOn: boolean,
): number | null {
  return item.priceFrom ?? (shopOn ? item.onlinePrice : undefined) ?? null;
}
