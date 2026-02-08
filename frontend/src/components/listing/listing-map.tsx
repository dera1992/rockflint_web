'use client';

import dynamic from 'next/dynamic';
import type { LatLngExpression } from 'leaflet';

import type { Listing } from '@/lib/api/types';

const MapContainer = dynamic(async () => (await import('react-leaflet')).MapContainer, {
  ssr: false
});
const Marker = dynamic(async () => (await import('react-leaflet')).Marker, { ssr: false });
const Popup = dynamic(async () => (await import('react-leaflet')).Popup, { ssr: false });
const TileLayer = dynamic(async () => (await import('react-leaflet')).TileLayer, { ssr: false });

const defaultPosition: LatLngExpression = [6.5244, 3.3792];

export function ListingMap({ listings }: { listings: Listing[] }) {
  const tileUrl =
    process.env.NEXT_PUBLIC_MAP_TILE_URL ?? 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const markers = listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    position: [listing.latitude ?? 6.5244, listing.longitude ?? 3.3792] as LatLngExpression
  }));

  return (
    <div className="h-[480px] w-full overflow-hidden rounded-xl border border-slate-200">
      <MapContainer center={defaultPosition} zoom={12} scrollWheelZoom={false} className="h-full">
        <TileLayer attribution="&copy; OpenStreetMap contributors" url={tileUrl} />
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>{marker.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
