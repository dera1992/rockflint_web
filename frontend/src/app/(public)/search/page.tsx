'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { ListingFilters } from '@/components/listing/listing-filters';
import { ListingCard } from '@/components/listing/listing-card';
import { ListingMap } from '@/components/listing/listing-map';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchListings, type ListingFilters as Filters } from '@/lib/api/endpoints/listings';

export default function SearchPage() {
  const [filters, setFilters] = useState<Filters>({ page: 1 });
  const [view, setView] = useState<'grid' | 'map'>('grid');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => fetchListings(filters)
  });

  return (
    <div className="container grid gap-8 py-10 lg:grid-cols-[320px_1fr]">
      <div className="space-y-6">
        <ListingFilters
          onSubmit={(values) =>
            setFilters({
              ...filters,
              search: values.search,
              min_price: values.min_price ? Number(values.min_price) : undefined,
              max_price: values.max_price ? Number(values.max_price) : undefined,
              bedrooms: values.bedrooms ? Number(values.bedrooms) : undefined,
              page: 1
            })
          }
        />
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Tip: Use the map view for location-aware browsing.
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">Search results</h2>
            <p className="text-sm text-slate-500">Showing verified listings</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('grid')}
            >
              Grid
            </Button>
            <Button
              variant={view === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('map')}
            >
              Map
            </Button>
          </div>
        </div>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
            Unable to load listings. Please try again.
          </div>
        ) : data ? (
          view === 'map' ? (
            <ListingMap listings={data.results} />
          ) : data.results.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {data.results.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No listings found. Try adjusting your filters.
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
