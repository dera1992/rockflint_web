'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { login, loginWithOtp, verifyOtp } from '@/lib/api/endpoints/auth';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  remember_me: z.boolean().optional()
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const [otpRequired, setOtpRequired] = useState<null | { user_id: number; remember_me: boolean }>(
    null
  );
  const [otp, setOtp] = useState('');
  const { setTokens } = useAuthStore();
  const { addToast } = useToastStore();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const otpStep = await loginWithOtp(values);
      if (otpStep.otp_required) {
        setOtpRequired({ user_id: otpStep.user_id, remember_me: otpStep.remember_me });
        return;
      }

      const tokenData = await login(values);
      setTokens(tokenData.access, tokenData.refresh);
      addToast({ title: 'Welcome back', variant: 'success' });
    } catch (error) {
      addToast({ title: 'Login failed', variant: 'error' });
    }
  };

  const handleOtp = async () => {
    if (!otpRequired) return;
    try {
      const tokenData = await verifyOtp({
        user_id: otpRequired.user_id,
        otp,
        remember_me: otpRequired.remember_me
      });
      setTokens(tokenData.access, tokenData.refresh);
      addToast({ title: 'Welcome back', variant: 'success' });
    } catch (error) {
      addToast({ title: 'OTP verification failed', variant: 'error' });
    }
  };

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-10">
      <div className="w-full max-w-md space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-slate-500">Sign in to manage your listings.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Email</label>
            <Input type="email" {...register('email')} />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Password</label>
            <Input type="password" {...register('password')} />
          </div>
          <Button type="submit" disabled={formState.isSubmitting} className="w-full">
            {formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        {otpRequired ? (
          <div className="space-y-3 rounded-lg border border-slate-200 p-4 text-sm">
            <p className="font-semibold">Enter the OTP sent to your device.</p>
            <Input value={otp} onChange={(event) => setOtp(event.target.value)} />
            <Button size="sm" onClick={handleOtp}>
              Verify OTP
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
