import GenericPageSkeleton from "@/components/ui/GenericPageSkeleton";

export default function LocaleLoading() {
  return (
    <div role="status" aria-label="Loading">
      <GenericPageSkeleton />
    </div>
  );
}
