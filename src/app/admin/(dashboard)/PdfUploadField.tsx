"use client";

export function PdfUploadField({
  name,
  label,
  currentUrl,
  specHint,
}: {
  name: string;
  label: string;
  currentUrl?: string | null;
  specHint: string;
}) {
  return (
    <div>
      <span className="text-sm font-medium text-text-2">{label}</span>
      <p className="mt-0.5 text-xs text-text-2">{specHint}</p>
      {currentUrl && (
        <a
          href={currentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-sm text-primary-600 hover:underline"
        >
          Current PDF ↗
        </a>
      )}
      <input
        type="file"
        name={name}
        accept="application/pdf"
        className="mt-2 block w-full text-sm text-text-2 file:mr-3 file:rounded-lg file:border file:border-border-strong file:bg-surface-0 file:px-3 file:py-1.5 file:text-sm file:text-text-1"
      />
    </div>
  );
}
