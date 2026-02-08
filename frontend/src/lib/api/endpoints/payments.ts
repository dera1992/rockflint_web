import { apiFetch } from '@/lib/api/client';

export async function fetchBillingOverview() {
  return apiFetch('/api/payments/overview/');
}
