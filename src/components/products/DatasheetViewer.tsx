import { Button } from "@/components/ui/Button";

export function DatasheetViewer({
  title,
  url,
  downloadLabel,
  unavailableLabel,
}: {
  title: string;
  url?: string;
  downloadLabel: string;
  unavailableLabel: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {url && (
          <Button href={url} external variant="ghost">
            {downloadLabel}
          </Button>
        )}
      </div>

      {url ? (
        <iframe
          src={url}
          title={title}
          className="mt-8 h-[600px] w-full rounded-xl border border-border"
        />
      ) : (
        <p className="mt-8 rounded-xl border border-dashed border-border-strong p-8 text-center text-text-2">
          {unavailableLabel}
        </p>
      )}
    </section>
  );
}
