import Image from 'next/image';
import Link from 'next/link';
import { BedDouble, Bath, MapPin, Star } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import type { Listing } from '@/lib/api/types';

interface ListingCardProps {
  listing: Listing;
  promoted?: boolean;
}

export function ListingCard({ listing, promoted }: ListingCardProps) {
  const image = listing.primary_image || listing.images?.[0]?.image;

  return (
    <Card className="group overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/listing/${listing.id}`} className="block">
        <div className="relative h-52 w-full bg-slate-100">
          {image ? (
            <Image
              src={image}
              alt={listing.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              No image available
            </div>
          )}
          <div className="absolute left-4 top-4 flex gap-2">
            {promoted ? <Badge className="bg-brand-600 text-white">Promoted</Badge> : null}
            <Badge className="bg-white/80 text-slate-700">Verified</Badge>
          </div>
        </div>
        <div className="space-y-3 p-5">
          <div>
            <p className="text-sm text-slate-500">{listing.category?.name ?? 'Residential'}</p>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {listing.title}
            </h3>
          </div>
          <p className="text-xl font-semibold text-brand-600">${listing.price.toLocaleString()}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {listing.bedrooms ?? 0} beds
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="h-4 w-4" /> {listing.bathrooms ?? 0} baths
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4" /> 4.8
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <MapPin className="h-4 w-4" /> {listing.address ?? 'Premium district'}
          </div>
        </div>
      </Link>
    </Card>
  );
}
