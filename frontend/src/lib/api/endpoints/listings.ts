import { apiFetch } from '@/lib/api/client';
import type { Listing, ListingImage, PaginationResponse, Review } from '@/lib/api/types';

export interface ListingFilters {
  search?: string;
  min_price?: number;
  max_price?: number;
  category?: number;
  offer?: number;
  state?: number;
  lga?: number;
  bedrooms?: number;
  ordering?: string;
  promoted?: boolean;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  page?: number;
}

export async function fetchListings(filters: ListingFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  return apiFetch<PaginationResponse<Listing>>(`/api/ads/listings/?${params.toString()}`, {
    auth: false
  });
}

export async function fetchListing(id: string | number) {
  return apiFetch<Listing>(`/api/ads/listings/${id}/`, { auth: false });
}

export async function createListing(payload: Partial<Listing>) {
  return apiFetch<Listing>('/api/ads/listings/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateListing(id: string | number, payload: Partial<Listing>) {
  return apiFetch<Listing>(`/api/ads/listings/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  });
}

export async function deleteListing(id: string | number) {
  return apiFetch(`/api/ads/listings/${id}/`, {
    method: 'DELETE'
  });
}

export async function toggleFavorite(id: string | number) {
  return apiFetch<{ favorited: boolean }>(`/api/ads/listings/${id}/toggle_favorite/`, {
    method: 'POST'
  });
}

export async function fetchListingReviews(id: string | number) {
  return apiFetch<Review[]>(`/api/ads/listings/${id}/reviews/`, { auth: false });
}

export async function addReview(id: string | number, payload: Partial<Review>) {
  return apiFetch<Review>(`/api/ads/listings/${id}/add_review/`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function fetchRecommendations(id: string | number) {
  return apiFetch<Listing[]>(`/api/ads/listings/${id}/recommendations/`, { auth: false });
}

export async function fetchListingImages() {
  return apiFetch<ListingImage[]>('/api/ads/listing-images/');
}

export async function uploadListingImage(payload: FormData) {
  return apiFetch<ListingImage>('/api/ads/listing-images/', {
    method: 'POST',
    body: payload
  });
}

export async function deleteListingImage(id: number) {
  return apiFetch(`/api/ads/listing-images/${id}/`, {
    method: 'DELETE'
  });
}
