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

      <section className="container grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Buy a home',
            description: 'Browse verified listings with transparent pricing and trusted agents.',
            href: '/search?offer=buy'
          },
          {
            title: 'Rent a home',
            description: 'Find flexible rentals with up-to-date availability and virtual tours.',
            href: '/search?offer=rent'
          },
          {
            title: 'Sell your home',
            description: 'List with confidence and reach qualified buyers faster.',
            href: '/search?offer=sell'
          }
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.description}</p>
            <div className="mt-4">
              <Link href={card.href}>
                <Button variant="secondary">Explore</Button>
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="container">
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-50">
              Ready to list?
            </p>
            <h2 className="text-2xl font-semibold md:text-3xl">
              List your property and connect with high-intent buyers today.
            </h2>
            <p className="text-sm text-white/90">
              Create a premium listing in minutes and manage viewings from your dashboard.
            </p>
          </div>
          <Link href="/dashboard/listings/new">
            <Button className="bg-white text-brand-700 hover:bg-brand-50">List your property</Button>
          </Link>
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
