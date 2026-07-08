const BUSINESS_TYPES = [
  "restaurant",
  "retail",
  "buffet",
  "convenience",
  "themepark",
  "hotel",
  "cafeteria",
  "bakery",
  "manufacturing",
] as const;

export function BusinessTypeCheckboxes({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  /** Business types currently selected. */
  defaultValue: string[];
}) {
  const selected = new Set(defaultValue);

  return (
    <div>
      <span className="text-sm font-medium text-text-2">{label}</span>
      <div className="mt-2 flex flex-wrap gap-4">
        {BUSINESS_TYPES.map((type) => (
          <label key={type} className="flex items-center gap-2 text-sm text-text-1">
            <input
              type="checkbox"
              name={name}
              value={type}
              defaultChecked={selected.has(type)}
              className="h-4 w-4"
            />
            {type}
          </label>
        ))}
      </div>
    </div>
  );
}
