'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { ChatWidget } from '@/components/chat/chat-widget';
import { SectionHeading } from '@/components/layout/section-heading';
import { ListingCard } from '@/components/listing/listing-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchListings } from '@/lib/api/endpoints/listings';

export default function HomePage() {
  const featuredQuery = useQuery({
    queryKey: ['listings', 'featured'],
    queryFn: () => fetchListings({ promoted: true, page: 1 })
  });
  const newestQuery = useQuery({
    queryKey: ['listings', 'newest'],
    queryFn: () => fetchListings({ ordering: '-created', page: 1 })
  });

  return (
    <div className="space-y-16">
      <section className="bg-gradient-to-br from-brand-50 via-white to-white py-16 dark:from-slate-950 dark:via-slate-950">
        <div className="container grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
              Premium real estate
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 dark:text-white md:text-5xl">
              Find the perfect home with a modern, intelligent search experience.
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Explore trusted listings, verify top agents, and schedule viewings with confidence.
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="grid gap-3 md:grid-cols-4">
                <Input placeholder="City, neighborhood" />
                <Input placeholder="Min price" />
                <Input placeholder="Beds" />
                <Button>Search</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Verified listings</span>
              <span>Secure bookings</span>
              <span>24/7 concierge support</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase text-slate-500">Top agents</p>
              <div className="space-y-4">
                {['BlueBay Realty', 'Urban Crest', 'Haven Group'].map((agent) => (
                  <div
                    key={agent}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold">{agent}</p>
                      <p className="text-xs text-slate-500">Verified partner</p>
                    </div>
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container space-y-6">
        <SectionHeading
          title="Featured listings"
          subtitle="Promoted homes curated by our partners."
        />
        {featuredQuery.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        ) : featuredQuery.data ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredQuery.data.results.slice(0, 6).map((listing) => (
              <ListingCard key={listing.id} listing={listing} promoted />
            ))}
          </div>
        ) : null}
      </section>

      <section className="container space-y-6">
        <SectionHeading title="New this week" subtitle="Fresh listings across top neighborhoods." />
        {newestQuery.isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-64" />
            ))}
          </div>
        ) : newestQuery.data ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {newestQuery.data.results.slice(0, 6).map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : null}
        <div className="flex justify-center">
          <Link href="/search">
            <Button variant="secondary">Browse all listings</Button>
          </Link>
        </div>
      </section>
      <ChatWidget />
    </div>
  );
}
