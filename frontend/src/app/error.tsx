'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center gap-4 py-10">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-slate-500">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
