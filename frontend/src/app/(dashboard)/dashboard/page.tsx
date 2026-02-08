'use client';

import { useQuery } from '@tanstack/react-query';

import { ListingCard } from '@/components/listing/listing-card';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchMe } from '@/lib/api/endpoints/auth';
import { fetchWishlist } from '@/lib/api/endpoints/customers';
import { fetchListings } from '@/lib/api/endpoints/listings';

export default function DashboardPage() {
  const wishlistQuery = useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist
  });
  const userQuery = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe
  });
  const recommendationsQuery = useQuery({
    queryKey: ['recommendations'],
    queryFn: () => fetchListings({ promoted: true, page: 1 })
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-slate-500">
          {userQuery.data?.email ? `Signed in as ${userQuery.data.email}` : 'Your dashboard overview.'}
        </p>
      </div>
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Saved listings</h2>
        {wishlistQuery.isLoading ? (
          <Skeleton className="mt-4 h-32" />
        ) : wishlistQuery.data?.length ? (
          <div className="mt-4 space-y-2 text-sm">
            {wishlistQuery.data.map((item) => (
              <div key={item.listing.id} className="flex items-center justify-between">
                <span>{item.listing.title}</span>
                <span className="text-slate-500">${item.listing.price}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No saved listings yet.</p>
        )}
      </Card>

      <div>
        <h2 className="text-xl font-semibold">Recommended for you</h2>
        {recommendationsQuery.isLoading ? (
          <Skeleton className="mt-4 h-40" />
        ) : recommendationsQuery.data ? (
          <div className="mt-4 grid gap-6 md:grid-cols-3">
            {recommendationsQuery.data.results.slice(0, 3).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
