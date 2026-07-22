"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <h1 className="text-xl font-bold text-text-1">Something went wrong</h1>
      <p className="max-w-md text-sm text-text-2">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-button bg-[image:var(--gradient-primary)] outline-offset-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-400 px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow-glow-primary)]"
      >
        Try again
      </button>
    </div>
  );
}
