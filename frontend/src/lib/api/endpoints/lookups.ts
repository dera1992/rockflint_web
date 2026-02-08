import { apiFetch } from '@/lib/api/client';
import type { Category, Feature, LGA, Offer, State } from '@/lib/api/types';

export async function fetchCategories() {
  return apiFetch<Category[]>('/api/ads/categories/', { auth: false });
}

export async function fetchOffers() {
  return apiFetch<Offer[]>('/api/ads/offers/', { auth: false });
}

export async function fetchStates() {
  return apiFetch<State[]>('/api/ads/states/', { auth: false });
}

export async function fetchLGAs(stateId?: number) {
  const suffix = stateId ? `?state=${stateId}` : '';
  return apiFetch<LGA[]>(`/api/ads/lgas/${suffix}`, { auth: false });
}

export async function fetchFeatures() {
  return apiFetch<Feature[]>('/api/ads/features/', { auth: false });
}
