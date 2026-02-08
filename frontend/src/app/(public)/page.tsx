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
            "linear-gradient(120deg, rgba(239,246,255,0.92), rgba(255,255,255,0.88)), url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container">
          <div className="max-w-2xl space-y-6 rounded-3xl border border-white/70 bg-white/80 p-8 shadow-xl backdrop-blur dark:border-slate-800/60 dark:bg-slate-950/70">
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
        <div className="flex flex-col gap-6 rounded-3xl border border-brand-100 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/15">
              <svg
                viewBox="0 0 140 140"
                className="h-20 w-20"
                role="img"
                aria-hidden="true"
              >
                <circle cx="40" cy="42" r="22" fill="#fbbf24" />
                <path d="M30 68L70 34L110 68" fill="#fff" opacity="0.2" />
                <path
                  d="M32 68L70 38L108 68"
                  stroke="#fff"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect x="40" y="68" width="60" height="46" rx="12" fill="#fff" opacity="0.9" />
                <rect x="62" y="84" width="16" height="30" rx="6" fill="#2563eb" />
                <circle cx="108" cy="42" r="8" fill="#93c5fd" />
              </svg>
            </div>
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
