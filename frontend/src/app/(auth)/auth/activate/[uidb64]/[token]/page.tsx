'use client';

import { useEffect, useState } from 'react';

import { activateAccount } from '@/lib/api/endpoints/auth';

export default function ActivateAccountPage({
  params
}: {
  params: { uidb64: string; token: string };
}) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const run = async () => {
      try {
        await activateAccount(params.uidb64, params.token);
        setStatus('success');
      } catch (error) {
        setStatus('error');
      }
    };
    run();
  }, [params.uidb64, params.token]);

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {status === 'loading' ? (
          <p className="text-sm text-slate-500">Activating your account...</p>
        ) : status === 'success' ? (
          <div>
            <h1 className="text-2xl font-semibold">Account activated</h1>
            <p className="mt-2 text-sm text-slate-500">You can now log in.</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-semibold">Activation failed</h1>
            <p className="mt-2 text-sm text-slate-500">
              The link may be invalid or expired. Please request a new activation email.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
