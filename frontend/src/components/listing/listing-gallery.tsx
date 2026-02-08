'use client';

import Image from 'next/image';
import { useState } from 'react';

import type { ListingImage } from '@/lib/api/types';

export function ListingGallery({ images }: { images: ListingImage[] }) {
  const [active, setActive] = useState(0);
  const activeImage = images[active];

  return (
    <div className="space-y-4">
      <div className="relative h-[420px] w-full overflow-hidden rounded-xl bg-slate-100">
        {activeImage ? (
          <Image
            src={activeImage.image}
            alt={activeImage.caption ?? 'Listing image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 60vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No images
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className={`relative h-20 overflow-hidden rounded-lg border ${
              index === active ? 'border-brand-500' : 'border-transparent'
            }`}
            onClick={() => setActive(index)}
          >
            <Image
              src={image.image}
              alt={image.caption ?? 'Thumbnail'}
              fill
              className="object-cover"
              sizes="120px"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
