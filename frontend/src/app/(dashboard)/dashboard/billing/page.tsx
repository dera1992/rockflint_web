'use client';

import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchBillingOverview } from '@/lib/api/endpoints/payments';

export default function BillingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: fetchBillingOverview
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-slate-500">Manage your subscriptions.</p>
      </div>
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Current plan</h2>
            <p className="mt-2 text-sm text-slate-500">Premium Seller</p>
            <Button className="mt-4" size="sm">
              Upgrade
            </Button>
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-semibold">Invoices</h2>
            <p className="mt-2 text-sm text-slate-500">
              {data ? 'Invoices synced from backend.' : 'No invoices found.'}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
