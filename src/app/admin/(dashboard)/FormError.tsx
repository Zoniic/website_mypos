import { CircleAlert } from "lucide-react";

export function FormError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="flex items-start gap-2 text-sm text-error">
      <CircleAlert size={16} strokeWidth={1.75} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span className="whitespace-pre-line">{children}</span>
    </p>
  );
}
