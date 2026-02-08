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
      <section
        className="relative overflow-hidden py-16"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.25) 45%, rgba(15,23,42,0) 75%), url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <div className="max-w-2xl space-y-6 py-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
              Premium real estate
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-5xl">
              Find the perfect home with a modern, intelligent search experience.
            </h1>
            <p className="text-base text-slate-100">
              Explore trusted listings, verify top agents, and schedule viewings with confidence.
            </p>
            <div className="rounded-xl border border-white/40 bg-white/95 p-4 shadow-lg">
              <div className="grid gap-3 md:grid-cols-4">
                <Input placeholder="City, neighborhood" />
                <Input placeholder="Min price" />
                <Input placeholder="Beds" />
                <Button>Search</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-slate-100">
              <span className="rounded-full bg-white/15 px-3 py-1">Verified listings</span>
              <span className="rounded-full bg-white/15 px-3 py-1">Secure bookings</span>
              <span className="rounded-full bg-white/15 px-3 py-1">
                24/7 concierge support
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container grid gap-6 md:grid-cols-3">
        {[
          {
            title: 'Buy a home',
            description: 'Browse verified listings with transparent pricing and trusted agents.',
            href: '/search?offer=buy',
            color: 'from-emerald-100 via-white to-white'
          },
          {
            title: 'Rent a home',
            description: 'Find flexible rentals with up-to-date availability and virtual tours.',
            href: '/search?offer=rent',
            color: 'from-sky-100 via-white to-white'
          },
          {
            title: 'Sell your home',
            description: 'List with confidence and reach qualified buyers faster.',
            href: '/search?offer=sell',
            color: 'from-rose-100 via-white to-white'
          }
        ].map((card) => {
          const gradientId = `${card.title.toLowerCase().replace(/\s+/g, '-')}-gradient`;

          return (
            <div
              key={card.title}
              className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${card.color} p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950`}
            >
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 shadow-sm dark:bg-slate-900/80">
                <svg
                  viewBox="0 0 120 120"
                  className="h-16 w-16"
                  role="img"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                  <circle cx="42" cy="42" r="24" fill="#fde68a" />
                  <rect
                    x="36"
                    y="54"
                    width="48"
                    height="40"
                    rx="10"
                    fill={`url(#${gradientId})`}
                  />
                  <path d="M28 56L60 30L92 56" fill="#1d4ed8" opacity="0.2" />
                  <path
                    d="M30 56L60 32L90 56"
                    stroke="#1e3a8a"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect x="52" y="70" width="16" height="24" rx="6" fill="#fff" />
                  <circle cx="92" cy="34" r="6" fill="#38bdf8" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {card.description}
              </p>
              <div className="mt-4">
                <Link href={card.href}>
                  <Button variant="secondary">Explore</Button>
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      <section className="container">
        <div className="grid gap-10 rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-100 via-brand-200 to-brand-300 p-8 text-slate-900 shadow-xl md:grid-cols-[1fr_1.1fr] md:items-center">
          <div className="flex items-center justify-center">
            <div className="flex h-64 w-full max-w-md items-center justify-center rounded-3xl bg-white/70 p-6 md:h-72">
              <svg
                viewBox="0 0 240 200"
                className="h-full w-full"
                role="img"
                aria-hidden="true"
              >
                <circle cx="64" cy="48" r="28" fill="#fbbf24" />
                <circle cx="190" cy="36" r="12" fill="#93c5fd" />
                <path d="M40 110L120 50L200 110" fill="#fff" opacity="0.2" />
                <path
                  d="M44 110L120 58L196 110"
                  stroke="#fff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="64" y="110" width="112" height="70" rx="16" fill="#fff" opacity="0.92" />
                <rect x="104" y="130" width="32" height="50" rx="8" fill="#2563eb" />
                <rect x="80" y="130" width="16" height="16" rx="4" fill="#c7d2fe" />
                <rect x="144" y="130" width="16" height="16" rx="4" fill="#c7d2fe" />
              </svg>
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              Ready to list?
            </p>
            <h2 className="text-2xl font-semibold md:text-3xl">
              List your property and connect with high-intent buyers today.
            </h2>
            <p className="text-sm text-slate-700">
              Create a premium listing in minutes and manage viewings from your dashboard.
            </p>
            <Link href="/dashboard/listings/new">
              <Button className="bg-brand-600 text-white hover:bg-brand-700">
                List your property
              </Button>
            </Link>
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
