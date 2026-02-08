import { RequireAuth } from '@/lib/auth/require-auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="container grid min-h-[80vh] gap-8 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold">Dashboard</p>
          <nav className="space-y-1 text-sm text-slate-600">
            <a href="/dashboard" className="block rounded-lg px-3 py-2 hover:bg-slate-100">
              Overview
            </a>
            <a
              href="/dashboard/profile"
              className="block rounded-lg px-3 py-2 hover:bg-slate-100"
            >
              Profile
            </a>
            <a
              href="/dashboard/listings"
              className="block rounded-lg px-3 py-2 hover:bg-slate-100"
            >
              Listings
            </a>
            <a
              href="/dashboard/billing"
              className="block rounded-lg px-3 py-2 hover:bg-slate-100"
            >
              Billing
            </a>
          </nav>
        </aside>
        <div>{children}</div>
      </div>
    </RequireAuth>
  );
}
