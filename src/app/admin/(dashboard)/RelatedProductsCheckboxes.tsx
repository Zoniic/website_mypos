export function RelatedProductsCheckboxes({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string;
  label: string;
  /** All other products this product could be related to. */
  options: { slug: string; name: string }[];
  /** Slugs currently selected. */
  defaultValue: string[];
}) {
  const selected = new Set(defaultValue);

  if (options.length === 0) {
    return (
      <div>
        <span className="text-sm font-medium text-text-2">{label}</span>
        <p className="mt-2 text-sm text-text-2">No other products yet.</p>
      </div>
    );
  }

  return (
    <div>
      <span className="text-sm font-medium text-text-2">{label}</span>
      <div className="mt-2 flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.slug} className="flex items-center gap-2 text-sm text-text-1">
            <input
              type="checkbox"
              name={name}
              value={option.slug}
              defaultChecked={selected.has(option.slug)}
              className="h-4 w-4"
            />
            {option.name} ({option.slug})
          </label>
        ))}
      </div>
    </div>
  );
}
