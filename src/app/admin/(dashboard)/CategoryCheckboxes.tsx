import { PRODUCT_CATEGORIES as CATEGORIES } from "@/data/categories";

export function CategoryCheckboxes({
  name,
  label,
  defaultValue,
  options = CATEGORIES,
}: {
  name: string;
  label: string;
  /** Categories currently selected. */
  defaultValue: string[];
  /** Every category incl. ones of lines added in /admin/catalog (defaults to the built-in list). */
  options?: readonly string[];
}) {
  const selected = new Set(defaultValue);

  return (
    <div>
      <span className="text-sm font-medium text-text-2">{label}</span>
      <div className="mt-2 flex flex-wrap gap-4">
        {options.map((category) => (
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
