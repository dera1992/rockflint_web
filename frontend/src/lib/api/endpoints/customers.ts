import { apiFetch } from '@/lib/api/client';
import type { CustomerProfile, FavoriteListing } from '@/lib/api/types';

export async function fetchCustomer(id: string | number) {
  return apiFetch<CustomerProfile>(`/api/customer/customers/${id}/`);
}

export async function fetchWishlist() {
  return apiFetch<FavoriteListing[]>('/api/customer/customers/wishlist/');
}
