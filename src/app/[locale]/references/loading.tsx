import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";

export default function ReferencesLoading() {
  return (
    <ListPageSkeleton columns="sm:grid-cols-2 lg:grid-cols-3" card="media" count={6} />
  );
}
