'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { register as registerUser } from '@/lib/api/endpoints/auth';
import { useToastStore } from '@/store/useToastStore';

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { addToast } = useToastStore();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerUser(values);
      addToast({
        title: 'Registration successful',
        description: 'Check your email to activate your account.'
      });
    } catch (error) {
      addToast({ title: 'Registration failed', variant: 'error' });
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-10">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-semibold">Create your account</h1>
          <p className="text-sm text-slate-500">Join our premium property network.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Username</label>
            <Input {...register('username')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <Input type="email" {...register('email')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Password</label>
            <Input type="password" {...register('password')} />
          </div>
          <Button type="submit" disabled={formState.isSubmitting} className="w-full">
            {formState.isSubmitting ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
