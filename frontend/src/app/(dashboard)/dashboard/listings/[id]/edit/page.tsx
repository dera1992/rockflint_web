'use client';

import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchListing, updateListing } from '@/lib/api/endpoints/listings';
import { useToastStore } from '@/store/useToastStore';

interface FormValues {
  title: string;
  price: number;
}

export default function EditListingPage({ params }: { params: { id: string } }) {
  const { addToast } = useToastStore();
  const listingQuery = useQuery({
    queryKey: ['listing', params.id],
    queryFn: () => fetchListing(params.id)
  });
  const { register, handleSubmit, formState } = useForm<FormValues>();

  const onSubmit = async (values: FormValues) => {
    try {
      await updateListing(params.id, values);
      addToast({ title: 'Listing updated', variant: 'success' });
    } catch (error) {
      addToast({ title: 'Unable to update listing', variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit listing</h1>
        <p className="text-sm text-slate-500">Update your listing information.</p>
      </div>
      {listingQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : listingQuery.data ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Title</label>
            <Input defaultValue={listingQuery.data.title} {...register('title')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Price</label>
            <Input type="number" defaultValue={listingQuery.data.price} {...register('price')} />
          </div>
          <Button type="submit" disabled={formState.isSubmitting}>
            Save
          </Button>
        </form>
      ) : null}
    </div>
  );
}
