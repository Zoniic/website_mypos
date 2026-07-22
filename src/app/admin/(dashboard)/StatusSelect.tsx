"use client";

export function StatusSelect({
  defaultValue,
  options,
  action,
}: {
  defaultValue: string;
  options: readonly string[];
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action}>
      <select
        name="status"
        defaultValue={defaultValue}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-lg border border-border-strong bg-surface-0 px-3 py-1.5 text-sm focus-visible:border-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </form>
  );
}
