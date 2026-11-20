import {
  BedDouble,
  Building2,
  ChefHat,
  Croissant,
  Factory,
  FerrisWheel,
  GraduationCap,
  Store,
  Tag,
  Utensils,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

// One Lucide icon per business type. The keys are stored in the catalog
// (see BUSINESS_ICONS in lib/catalog.ts), so keep them stable.
const icons: Record<string, LucideIcon> = {
  restaurant: UtensilsCrossed,
  retail: Tag,
  buffet: ChefHat,
  convenience: Store,
  themepark: FerrisWheel,
  hotel: BedDouble,
  cafeteria: Utensils,
  bakery: Croissant,
  office: Building2,
  school: GraduationCap,
  manufacturing: Factory,
};

/** Storefront for business types without their own icon. */
const GenericIcon = Store;

/** `type`: a business type slug, or an icon key chosen for a type added in the admin. */
export function BusinessTypeIcon({ type, size = 18 }: { type: string; size?: number }) {
  const Icon = icons[type] ?? GenericIcon;
  return <Icon size={size} strokeWidth={1.75} aria-hidden="true" />;
}
