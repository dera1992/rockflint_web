'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfile } from '@/lib/api/endpoints/auth';
import { useToastStore } from '@/store/useToastStore';

interface ProfileValues {
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_image: string;
}

export default function ProfilePage() {
  const { addToast } = useToastStore();
  const { register, handleSubmit, formState } = useForm<ProfileValues>({
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      profile_image: ''
    }
  });

  const onSubmit = async (values: ProfileValues) => {
    try {
      await updateProfile(values);
      addToast({ title: 'Profile updated', variant: 'success' });
    } catch (error) {
      addToast({ title: 'Unable to update profile', variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile settings</h1>
        <p className="text-sm text-slate-500">Manage your personal details.</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-600">First name</label>
            <Input {...register('first_name')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Last name</label>
            <Input {...register('last_name')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Phone</label>
            <Input {...register('phone_number')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Profile image URL</label>
            <Input {...register('profile_image')} />
          </div>
        </div>
        <Button type="submit" disabled={formState.isSubmitting}>
          Save changes
        </Button>
      </form>
    </div>
  );
}
