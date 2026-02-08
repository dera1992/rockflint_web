'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';

import { ListingGallery } from '@/components/listing/listing-gallery';
import { ListingMap } from '@/components/listing/listing-map';
import { ListingCard } from '@/components/listing/listing-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchListing,
  fetchListingReviews,
  fetchRecommendations,
  toggleFavorite
} from '@/lib/api/endpoints/listings';
import { useToastStore } from '@/store/useToastStore';

export default function ListingDetailsPage({ params }: { params: { id: string } }) {
  const { addToast } = useToastStore();
  const listingQuery = useQuery({
    queryKey: ['listing', params.id],
    queryFn: () => fetchListing(params.id)
  });
  const reviewsQuery = useQuery({
    queryKey: ['listing', params.id, 'reviews'],
    queryFn: () => fetchListingReviews(params.id)
  });
  const recommendationsQuery = useQuery({
    queryKey: ['listing', params.id, 'recommendations'],
    queryFn: () => fetchRecommendations(params.id)
  });

  if (listingQuery.isLoading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (listingQuery.isError || !listingQuery.data) {
    return (
      <div className="container py-10">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          Unable to load listing.
        </div>
      </div>
    );
  }

  const listing = listingQuery.data;

  return (
    <div className="container space-y-10 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{listing.category?.name ?? 'Listing'}</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
            {listing.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{listing.address ?? 'Address pending'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const result = await toggleFavorite(listing.id);
                addToast({
                  title: result.favorited ? 'Saved to favorites' : 'Removed from favorites',
                  variant: 'success'
                });
              } catch (error) {
                addToast({ title: 'Login required to favorite', variant: 'error' });
              }
            }}
          >
            <Heart className="h-4 w-4" />
            Favorite
          </Button>
          <Button>Schedule viewing</Button>
        </div>
      </div>

      <ListingGallery images={listing.images} />

      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap gap-3">
              <Badge>Bedrooms {listing.bedrooms ?? 0}</Badge>
              <Badge>Bathrooms {listing.bathrooms ?? 0}</Badge>
              <Badge>{listing.area ?? 0} sqft</Badge>
            </div>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              {listing.description ?? 'No description provided.'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Amenities</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.features?.length ? (
                listing.features.map((feature) => (
                  <Badge key={feature.id}>{feature.name}</Badge>
                ))
              ) : (
                <p className="text-sm text-slate-500">Amenities details pending.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Reviews</h3>
            <div className="mt-4 space-y-3">
              {reviewsQuery.data?.length ? (
                reviewsQuery.data.map((review) => (
                  <div key={review.id} className="rounded-lg border border-slate-100 p-4">
                    <p className="text-sm font-semibold">{review.title}</p>
                    <p className="text-xs text-slate-500">{review.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs uppercase text-slate-500">Price</p>
            <p className="text-2xl font-semibold text-brand-600">${listing.price}</p>
            <Button className="mt-4 w-full">Contact agent</Button>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-lg font-semibold">Location</h3>
            <div className="mt-3">
              <ListingMap listings={[listing]} />
            </div>
            {!listing.latitude || !listing.longitude ? (
              <p className="mt-2 text-xs text-slate-500">
                Location is approximate based on address.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-2xl font-semibold">Similar listings</h3>
        <div className="grid gap-6 md:grid-cols-3">
          {recommendationsQuery.data?.map((item) => (
            <ListingCard key={item.id} listing={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
