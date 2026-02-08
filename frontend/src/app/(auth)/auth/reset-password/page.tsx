'use client';

import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { passwordResetConfirm } from '@/lib/api/endpoints/auth';
import { useToastStore } from '@/store/useToastStore';

const schema = z.object({
  token: z.string().min(6),
  new_password: z.string().min(6)
});

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { addToast } = useToastStore();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token
    }
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await passwordResetConfirm(values);
      addToast({ title: 'Password updated', description: 'You can now log in.' });
    } catch (error) {
      addToast({ title: 'Unable to reset password', variant: 'error' });
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-10">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-semibold">Reset password</h1>
          <p className="text-sm text-slate-500">Enter your reset token and new password.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Token</label>
            <Input {...register('token')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">New password</label>
            <Input type="password" {...register('new_password')} />
          </div>
          <Button type="submit" disabled={formState.isSubmitting} className="w-full">
            {formState.isSubmitting ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
