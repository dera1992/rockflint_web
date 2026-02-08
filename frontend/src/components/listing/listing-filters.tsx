'use client';

import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface FilterValues {
  search?: string;
  min_price?: string;
  max_price?: string;
  bedrooms?: string;
}

export function ListingFilters({
  onSubmit
}: {
  onSubmit: (values: FilterValues) => void;
}) {
  const { register, handleSubmit } = useForm<FilterValues>();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <label className="text-xs font-semibold text-slate-600">Search</label>
        <Input placeholder="City, neighborhood, or ZIP" {...register('search')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600">Min price</label>
          <Input placeholder="$250k" {...register('min_price')} />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Max price</label>
          <Input placeholder="$1.2m" {...register('max_price')} />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-600">Bedrooms</label>
        <Input placeholder="3" {...register('bedrooms')} />
      </div>
      <Button type="submit" className="w-full">
        Apply filters
      </Button>
    </form>
  );
}
