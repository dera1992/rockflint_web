'use client';

import { useQuery } from '@tanstack/react-query';

import { ListingCard } from '@/components/listing/listing-card';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchListings } from '@/lib/api/endpoints/listings';
import { fetchVendor } from '@/lib/api/endpoints/vendors';

export default function AgentDetailsPage({ params }: { params: { id: string } }) {
  const vendorQuery = useQuery({
    queryKey: ['vendor', params.id],
    queryFn: () => fetchVendor(params.id)
  });
  const listingsQuery = useQuery({
    queryKey: ['vendor', params.id, 'listings'],
    queryFn: () => fetchListings({ page: 1 })
  });

  if (vendorQuery.isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-44" />
      </div>
    );
  }

  if (vendorQuery.isError || !vendorQuery.data) {
    return (
      <div className="container py-10">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          Unable to load vendor.
        </div>
      </div>
    );
  }

  const vendor = vendorQuery.data;

  return (
    <div className="container space-y-8 py-10">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">{vendor.company_name ?? vendor.user_name}</h1>
        <p className="text-sm text-slate-500">{vendor.user_email}</p>
        <div className="mt-3 text-xs text-slate-500">{vendor.phone_number ?? 'Phone on request'}</div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Listings</h2>
        {listingsQuery.isLoading ? (
          <Skeleton className="h-44" />
        ) : listingsQuery.data ? (
          <div className="grid gap-6 md:grid-cols-3">
            {listingsQuery.data.results.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No listings found.</p>
        )}
      </div>
    </div>
  );
}
