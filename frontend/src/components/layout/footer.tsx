import Link from 'next/link';

const footerLinks = [
  { label: 'About', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Support', href: '#' },
  { label: 'Privacy', href: '#' }
];

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-950">
      <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <p className="text-sm font-semibold">Rockflint Realty</p>
          <p className="text-xs text-slate-500">Premium real estate discovery & listings.</p>
        </div>
        <div className="flex items-center gap-6">
          {footerLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
