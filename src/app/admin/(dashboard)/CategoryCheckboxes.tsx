const CATEGORIES = ["self-order", "weigh-pay", "pos", "ticketing"] as const;

export function CategoryCheckboxes({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  /** Categories currently selected. */
  defaultValue: string[];
}) {
  const selected = new Set(defaultValue);

  return (
    <div>
      <span className="text-sm font-medium text-text-2">{label}</span>
      <div className="mt-2 flex flex-wrap gap-4">
        {CATEGORIES.map((category) => (
          <label key={category} className="flex items-center gap-2 text-sm text-text-1">
            <input
              type="checkbox"
              name={name}
              value={category}
              defaultChecked={selected.has(category)}
              className="h-4 w-4 rounded outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400"
            />
            {category}
          </label>
        ))}
      </div>
    </div>
  );
}
