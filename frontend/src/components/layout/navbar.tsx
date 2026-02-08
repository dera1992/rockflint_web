'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/agents', label: 'Agents' },
  { href: '/dashboard', label: 'Dashboard' }
];

export function Navbar() {
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-slate-900 dark:text-white">
          Rockflint Realty
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                pathname === item.href && 'text-brand-600 dark:text-brand-400'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-medium text-slate-600">
            Sign in
          </Link>
          <Button size="sm">List your home</Button>
          <button
            type="button"
            className="rounded-full border border-slate-200 p-2 text-slate-600 shadow-sm dark:border-slate-700 dark:text-slate-200"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {mounted ? (
              isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
            ) : (
              <span className="block h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
