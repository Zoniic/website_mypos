import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";

export default function AccessoriesLoading() {
  return (
    <ListPageSkeleton columns="sm:grid-cols-2 lg:grid-cols-4" card="padded" count={8} />
  );
}
