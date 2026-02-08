import { apiFetch } from '@/lib/api/client';
import type { Vendor, VendorDashboard, VendorSummary } from '@/lib/api/types';

export async function fetchVendors() {
  return apiFetch<VendorSummary[]>('/api/agent/public-vendors/', { auth: false });
}

export async function fetchVendor(id: string | number) {
  return apiFetch<Vendor>(`/api/agent/public-vendors/${id}/`, { auth: false });
}

export async function fetchVendorDashboard(id: string | number) {
  return apiFetch<VendorDashboard>(`/api/agent/vendors/${id}/dashboard/`);
}

export async function fetchVendorActivities(id: string | number) {
  return apiFetch(`/api/agent/vendors/${id}/activities/`);
}

export async function verifyVendor(id: string | number) {
  return apiFetch(`/api/agent/vendors/${id}/verify/`, {
    method: 'POST'
  });
}
