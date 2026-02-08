'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { fetchCategories, fetchFeatures, fetchLGAs, fetchOffers, fetchStates } from '@/lib/api/endpoints/lookups';
import { createListing } from '@/lib/api/endpoints/listings';
import type { Listing } from '@/lib/api/types';
import { ListingImageUploader } from '@/components/forms/listing-image-uploader';
import { useToastStore } from '@/store/useToastStore';

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10).optional(),
  price: z.number().min(0),
  rent_period: z.string().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  area: z.number().optional(),
  address: z.string().optional(),
  category: z.number().min(1, 'Category is required'),
  offer: z.number().min(1, 'Offer is required'),
  state: z.number().min(1, 'State is required'),
  lga: z.number().min(1, 'LGA is required'),
  features: z.array(z.number()).optional()
});

type ListingFormValues = z.infer<typeof schema>;

export function ListingWizard() {
  const [listing, setListing] = useState<Listing | null>(null);
  const { addToast } = useToastStore();
  const { register, handleSubmit, formState, watch, setValue } = useForm<ListingFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      features: []
    }
  });
  const selectedState = watch('state');

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const offersQuery = useQuery({ queryKey: ['offers'], queryFn: fetchOffers });
  const statesQuery = useQuery({ queryKey: ['states'], queryFn: fetchStates });
  const lgasQuery = useQuery({
    queryKey: ['lgas', selectedState],
    queryFn: () => fetchLGAs(selectedState),
    enabled: Boolean(selectedState)
  });
  const featuresQuery = useQuery({ queryKey: ['features'], queryFn: fetchFeatures });

  const featureOptions = useMemo(() => featuresQuery.data ?? [], [featuresQuery.data]);

  const onSubmit = async (values: ListingFormValues) => {
    try {
      const created = await createListing(values);
      setListing(created);
      addToast({ title: 'Listing created', variant: 'success' });
    } catch (error) {
      addToast({ title: 'Unable to create listing', variant: 'error' });
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">Title</label>
            <Input placeholder="Modern waterfront villa" {...register('title', { required: true })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Price</label>
            <Input type="number" {...register('price', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Bedrooms</label>
            <Input type="number" {...register('bedrooms', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Bathrooms</label>
            <Input type="number" {...register('bathrooms', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Area (sqft)</label>
            <Input type="number" {...register('area', { valueAsNumber: true })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Rent period</label>
            <Input placeholder="monthly" {...register('rent_period')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Address</label>
            <Input placeholder="City, State" {...register('address')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Category</label>
            <Select {...register('category', { valueAsNumber: true })}>
              <option value="">Select category</option>
              {categoriesQuery.data?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Offer</label>
            <Select {...register('offer', { valueAsNumber: true })}>
              <option value="">Select offer</option>
              {offersQuery.data?.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">State</label>
            <Select {...register('state', { valueAsNumber: true })}>
              <option value="">Select state</option>
              {statesQuery.data?.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">LGA</label>
            <Select {...register('lga', { valueAsNumber: true })} disabled={!selectedState}>
              <option value="">Select LGA</option>
              {lgasQuery.data?.map((lga) => (
                <option key={lga.id} value={lga.id}>
                  {lga.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-600">Description</label>
          <Textarea {...register('description')} />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">Amenities / Features</p>
          <div className="flex flex-wrap gap-3 text-xs">
            {featureOptions.map((feature) => (
              <label key={feature.id} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  value={feature.id}
                  onChange={(event) => {
                    const current = watch('features') ?? [];
                    if (event.target.checked) {
                      setValue('features', [...current, feature.id]);
                    } else {
                      setValue(
                        'features',
                        current.filter((id) => id !== feature.id)
                      );
                    }
                  }}
                />
                <span>{feature.name}</span>
              </label>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? 'Creating...' : 'Create listing'}
        </Button>
      </form>
      {listing ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">
            Step 2: Upload images for <strong>{listing.title}</strong>
          </div>
          <ListingImageUploader listingId={listing.id} />
        </div>
      ) : null}
    </div>
  );
}
