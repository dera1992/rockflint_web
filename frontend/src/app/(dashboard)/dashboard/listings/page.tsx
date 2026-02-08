'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteListing, fetchListings } from '@/lib/api/endpoints/listings';
import { useToastStore } from '@/store/useToastStore';

export default function DashboardListingsPage() {
  const { addToast } = useToastStore();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-listings'],
    queryFn: () => fetchListings({ page: 1 })
  });

  const handleDelete = async (id: number) => {
    try {
      await deleteListing(id);
      addToast({ title: 'Listing deleted', variant: 'success' });
      refetch();
    } catch (error) {
      addToast({ title: 'Unable to delete listing', variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Manage listings</h1>
          <p className="text-sm text-slate-500">Create, edit, and promote your listings.</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button>Create listing</Button>
        </Link>
      </div>
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid gap-4">
          {data?.results.map((listing) => (
            <Card key={listing.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{listing.title}</p>
                <p className="text-xs text-slate-500">${listing.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/listings/${listing.id}/edit`}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => handleDelete(listing.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
