import { ListPageSkeleton } from "@/components/ui/ListPageSkeleton";

export default function ProductsLoading() {
  return (
    <ListPageSkeleton
      columns="sm:grid-cols-2 lg:grid-cols-4"
      card="padded"
      count={8}
      filterRow
    />
  );
}
