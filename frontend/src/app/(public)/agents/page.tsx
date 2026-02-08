'use client';

import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchVendors } from '@/lib/api/endpoints/vendors';

export default function AgentsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['vendors'],
    queryFn: fetchVendors
  });

  return (
    <div className="container space-y-8 py-10">
      <div>
        <h1 className="text-3xl font-semibold">Top agents</h1>
        <p className="text-sm text-slate-500">Verified professionals with premium listings.</p>
      </div>
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-44" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
          Unable to load agents.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {data?.map((vendor) => (
            <Card key={vendor.id} className="p-6">
              <p className="text-lg font-semibold">{vendor.company_name ?? vendor.user_name}</p>
              <p className="text-xs text-slate-500">{vendor.user_email}</p>
              {vendor.verified ? (
                <p className="mt-2 text-xs font-semibold text-emerald-600">Verified</p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">Pending verification</p>
              )}
              <Button className="mt-4" size="sm">
                View profile
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
