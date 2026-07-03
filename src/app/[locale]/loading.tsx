export default function LocaleLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-border-strong border-t-primary"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
