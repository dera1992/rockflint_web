import { ListingWizard } from '@/components/forms/listing-wizard';

export default function NewListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create new listing</h1>
        <p className="text-sm text-slate-500">Follow the steps to publish your listing.</p>
      </div>
      <ListingWizard />
    </div>
  );
}
