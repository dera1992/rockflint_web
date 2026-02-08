import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container space-y-4 py-10">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-72" />
      <Skeleton className="h-10 w-1/3" />
    </div>
  );
}
